import React, { Component } from "react";
import axios from "axios";
import moment from "moment";
import { Table } from "react-bootstrap";
import ReactTimeout from "react-timeout";

import Api from "../api";

import "./style.css";

const THIRTY_SECONDS_IN_MILLIS = 30 * 1000;

class Departures extends Component {

  state = {
    departures: null,
    stopName: null
  };

  constructor(props) {
    super(props);
    this.state.stopName = props.stopName;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      stopName: nextProps.stopName
    });
  }

  componentDidMount() {
    this.refreshDepartures();
    this.props.setInterval(this.refreshDepartures, THIRTY_SECONDS_IN_MILLIS);
  }

  processTimestamps(departures) {
    const endOfToday = moment().endOf("day");
    departures.forEach(item => {
      item.departures = item.departures.map(ts => {
        const timestamp = moment(ts);
        return {
          time: timestamp.format("H:mm"),
          isToday: timestamp.isBefore(endOfToday),
          moment: timestamp
        }
      });
    });
    return departures;
  }

  refreshDepartures() {
    axios.get(Api.DEPARTURES_API)
      .then(response => this.processTimestamps(response.data))
      .then(departures => this.setState({ departures }))
      .catch(() => this.setState({ departures: null }));
  }

  createCell(depTime, index) {
    const notTodayClass = depTime.isToday ? "" : "not-today";
    return (
      <td key={index} className={notTodayClass}>
        {depTime.time} ({depTime.moment.fromNow()})
      </td>
    )
  }

  createLineRow(departure, index) {
    return (
      <tr key={index}>
        <td><h2>{departure.line}</h2></td>
        {departure.departures.map(this.createCell)}
      </tr>
    );
  }

  render() {
    if (!this.state.departures) {
      return <div>Aikataulutietoja ei saatu</div>
    }

    return (
      <div>
      <h3>Seuraavat lähdöt pysäkiltä {this.state.stopName}</h3>
      <Table>
        <tbody>
        {this.state.departures.map((departure, i) => this.createLineRow(departure, i))}
        </tbody>
      </Table>
     </div>
    );
  }
}

export default ReactTimeout(Departures);