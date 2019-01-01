import React, { Component } from 'react';
import axios from "axios";
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import "moment/locale/fi";
import ReactTimeout from "react-timeout";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Api from "../api";

import "./style.css";

const TWO_HOURS_IN_MILLIS = 2 * 60 * 60 * 1000;

class Agenda extends Component {

  constructor(props) {
    super(props);

    this.state = {
      subject: props.subject,
      agenda: undefined,
      date: this.getCurrentWeekStartDate(moment()).toDate()
    };
  }

  componentDidMount() {
    this.refreshAgenda();
    this.props.setInterval(this.refreshAgenda, TWO_HOURS_IN_MILLIS);
  }

  refreshAgenda() {
    const { subject, date } = this.state;
    if (subject) {
      const config = {
        params: {
          date: moment(date).format("YYYY-MM-DD")
        }
      };
      axios.get(`${Api.AGENDA_API}/${subject}`, config)
        .then(response => this.transformToEvents(response.data))
        .then(agenda => this.setState({ agenda }))
        .catch(() => this.setState({ agenda: null }));
    }
  }

  getCurrentWeekStartDate(now) {
    const isoWeekday = moment(now).isoWeekday();
    const isWeekend = isoWeekday === 6 || isoWeekday === 7;

    if (isWeekend) {
      now.add(7, "days"); // Mutates now
    }

    return moment(now).startOf("isoWeek").startOf("day");
  }

  transformToEvents(data) {
    return data.map(event => ({
      title: event.title,
      allDay: false,
      resource: false,
      start: moment(event.start).toDate(),
      end: moment(event.end).toDate()
    }));
  }

  viewChanged(date) {
    this.setState({ date }, this.refreshAgenda);
  }

  render() {
    if (!this.state.agenda) {
      return <div>Ei opetusta</div>
    }

    const localizer = BigCalendar.momentLocalizer(moment);
    const dayFormat = (date, culture, localizer) => localizer.format(date, "dddd D.M.", culture);
    return (
      <div>
        <h1 className="text-center text-capitalize">{this.state.subject}</h1>
        <BigCalendar
          onNavigate={this.viewChanged.bind(this)}
          min={moment().hour(8).minute(0).toDate()}
          max={moment().hour(16).minute(0).toDate()}
          timeslots={4}
          step={15}
          localizer={localizer}
          formats={{ dayFormat }}
          toolbar={false}
          views={["work_week"]}
          defaultView={"work_week"}
          events={this.state.agenda}
          defaultDate={this.state.date}
        />
      </div>
    );
  }
}

export default ReactTimeout(Agenda);
