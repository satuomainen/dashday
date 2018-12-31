const moment = require("moment");
const axios = require("axios");
const cheerio = require("cheerio");

const departureConfig = require("../../app-config").departures;

/**
 * The endpoint's SSL is a bit wonky, cannot get it to work without this dangerous kludge.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Caution!

/**
 * Scrape schedule data from the td HTML element.
 */
const extractScheduleData = (i, row) => {
  const cRow = cheerio.load(row);
  const line = cRow(".symbolColumn").text();
  const direction = cRow(".directionColumn").text();
  const departures = cRow(".timeColumn").map((i, elem) => cheerio.load(elem).text()).get();
  return {
    line,
    direction,
    departures
  }
};

/**
 * Comparator for two moment.js timestamps.
 */
const sortByStartDateAsc = (left, right) => moment.utc(left).diff(moment.utc(right));

/**
 * Comparator for strings (or other things that can be compared).
 */
const sortStringsAsc = (left, right) => {
  if (left < right) return -1;
  if (left === right) return 0;
  return 1;
};

/**
 * The departure times can be for tomorrow. If the time in timeString has already
 * passed for today, then make it a time for tomorrow. Otherwise it's a time for
 * today.
 *
 * The timeString can also be like "34m", which means the departure is in 34 minutes.
 */
const createNextPossibleMoment = timeString => {
  const now = moment();
  const minutesFromNow = timeString.match(/(\d+)m/);
  const time = minutesFromNow ? moment().add(minutesFromNow[1], "minutes") : moment(timeString, "H:mm");
  if (time.isBefore(now)) {
    // Tomorrow's time
    time.add(1, "day");
  }

  return time;
};

/**
 * The bus lines are returned separately if they have a different destination. In
 * our case it is not relevant so all the times related to the same line should be
 * put together and ordered.
 */
const combineLines = data => {
  const linesAndDepartureMoments = {};
  data.forEach(item => {
    const existingDepartureMoments = linesAndDepartureMoments[item.line] || [];
    const newDepartureMoments = item.departures
      .filter(departure => departure && "-" !== (departure))
      .map(createNextPossibleMoment);
    const allDepartureMoments = existingDepartureMoments.concat(newDepartureMoments).sort(sortByStartDateAsc);
    linesAndDepartureMoments[item.line] = allDepartureMoments.filter(d => d !== null).slice(0, 3);
  });

  const combinedLines = Object.keys(linesAndDepartureMoments).map(line => ({
    line: line,
    departures: linesAndDepartureMoments[line]
  }));
  combinedLines.sort(sortStringsAsc);

  return combinedLines;
};

/**
 * Find the data from the HTML doc and put it into JS objects.
 */
const scheduleSuccessHandler = res => {
  const doc = cheerio.load(res.data);
  const nextDepartureRows = doc("tr", "#nextDepartures");
  const scheduleData = nextDepartureRows.map(extractScheduleData).get();

  return combineLines(scheduleData);
};

/**
 * Scrape the next three departures for all lines stopping at the bus stop
 * specified in the configuration.
 */
const getNextDepartures = () => {
  return axios
    .get(departureConfig.url, { params: departureConfig.config })
    .then(scheduleSuccessHandler);
};

module.exports = {
  getNextDepartures
};

