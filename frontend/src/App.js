import React, { Component } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Clock from "react-live-clock";
import axios from "axios";

import Api from "./api";
import Departures from "./departures";
import Agenda from "./agenda";

import "./App.css";

class App extends Component {

  state = {
    agendas: [],
    departures: {
      stopName: null
    }
  };

  componentDidMount() {
    axios.get(Api.CONFIG_API)
      .then(response => {
        this.setState(response.data);
      })
      .catch(() => {
        console.log("Failed to get configuration");
      })
  }


  render() {
    return (
      <Container className="App" fluid={true}>
          <Row>
            <Col className="no-pad">
              <a className="weatherwidget-io col-12"
                 href="https://forecast7.com/en/61d4724d04/kangasala/"
                 data-label_1="Kangasala"
                 data-theme="original"
              >
                Sääennuste
              </a>
            </Col>
          </Row>
          <Row>
            <Col md={2} className="text-center">
              <div className="center-block">
                <h1 className="current-time"><Clock format={'HH:mm'} ticking={true}/></h1>
                <h3 className="current-date"><Clock format={"DD.MM.YYYY"} ticking={true}/></h3>
              </div>
            </Col>
            <Col md={10}>
              <Departures stopName={this.state.departures.stopName}/>
            </Col>
          </Row>
          <Row>
            {this.state.agendas.map(person => <Col key={person}><Agenda subject={person}></Agenda></Col>) }
          </Row>
      </Container>
    );
  }
}

export default App;
