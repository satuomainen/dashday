const fs = require("fs");
const moment = require("moment");
const ICAL = require("ical.js");
const axios = require("axios");

const agendaConfig = require("../../app-config.json").agendas;

/**
 * Extract all VEVENT items from the iCal component
 */
const getAllEvents = icalComponent => icalComponent
  .getAllSubcomponents("vevent")
  .map(comp => new ICAL.Event(comp));

/**
 * Transform a moment.js timestamp to ICAL.Time
 */
const momentToICalTime = m => ICAL.Time.fromJSDate(m.toDate());

/**
 * Single source of truth for creating a title for an event
 */
const createEventTitle = iCalEvent => `${iCalEvent.summary}\n${iCalEvent.location ? iCalEvent.location : ""}`;

/**
 * Comparator for moment.js timestamps
 */
const sortByStartDateAsc = (left, right) => moment.utc(left.startDate).diff(moment.utc(right.startDate));

/**
 * Transform an ICAL.Event into a JS object that is returned through the API
 */
const icalEventToEvent = (iCalEvent, startDate, endDate) => ({
  title: createEventTitle(iCalEvent),
  start: startDate ? startDate.toJSDate() : iCalEvent.startDate.toJSDate(),
  end: endDate ? endDate.toJSDate() : iCalEvent.endDate.toJSDate(),
  allDay: false,
  resource: false,
});

/**
 * Based on the given date, find the dates for Monday and Sunday of the current week
 */
const getCurrentOrNextWeekStartAndEndDates = now => ({
  weekStartDate: moment(now).startOf("isoWeek").startOf("day"),
  weekEndDate: moment(now).endOf("isoWeek").endOf("day")
});

/**
 * Predicate for testing if iCalTime is between rangeStart and rangeEnd (inclusively)
 */
const isICalTimeInRange = (iCalTime, rangeStart, rangeEnd) => {
  const isAfterRangeStart = iCalTime.compare(rangeStart) >= 0;
  const isBeforeRangeEnd = iCalTime.compare(rangeEnd) <= 0;
  return isAfterRangeStart && isBeforeRangeEnd;
};

/**
 * Expand a potentially recurring event to an individual event that occurs during the
 * given range (from weekStartDate to weekEndDate). If there is no occurrence during
 * the range, returns null.
 *
 * If the event is not recurring, it is returned if it occurs during the range.
 * Otherwise null is returned.
 */
const expandToRangeOrNull = (event, weekStartDate, weekEndDate) => {
  if (event.isRecurring()) {
    const iterator = event.iterator();
    while (iterator.next()) {
      const lastRecurrence = iterator.last;
      if (isICalTimeInRange(lastRecurrence, weekStartDate, weekEndDate)) {
        const endTime = ICAL.Time.fromJSDate(lastRecurrence.toJSDate());
        endTime.addDuration(event.duration);
        return icalEventToEvent(event, lastRecurrence, endTime);
      }
    }
    return null;
  }
  else {
    if (isICalTimeInRange(event.startDate, weekStartDate, weekEndDate)) {
      return icalEventToEvent(event);
    }
    return null;
  }
};

/**
 * Takes an ics/iCal file contents and returns an array of calendar events
 * that occur during the same week as the given date.
 *
 */
const parseData = (data, date) => {
  const calendar = ICAL.parse(data);
  const component = new ICAL.Component(calendar);
  const rightNow = date ? moment(date) : moment();
  const { weekStartDate, weekEndDate } = getCurrentOrNextWeekStartAndEndDates(rightNow);
  const allEvents = getAllEvents(component);

  return allEvents
    .map(e => expandToRangeOrNull(e, momentToICalTime(weekStartDate), momentToICalTime(weekEndDate)))
    .filter(e => e !== null)
    .sort(sortByStartDateAsc);
};

/**
 * Return a Promise that resolves to the agenda for the given agendaId
 *
 * @param agendaId
 */
const getAgenda = (agendaId, date) => {
  const { url, token, f, p } = agendaConfig[agendaId];
  const config = {
    params: {
      token,
      f, // get events to f days into the future
      p, // get events from p days from the past
      tstamp: parseInt(new Date().getTime() / 1000)
    }
  };

  return axios
    .get(url, config)
    .then(res => parseData(res.data, date));
};

/**
 * Mock implementation that reads the calendar data from a file instead of
 * bothering the actual resource in the Internet
 */
const getAgendaMock = (agendaId, date) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${agendaId}.dat`, { encoding: "utf8" }, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(parseData(data, date))
      }
    });
  });
};

module.exports = {
  // getAgenda
  getAgenda: getAgendaMock
};