var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var agendaRouter = require('./feature/agenda/agenda_routes');
var configRouter = require("./feature/config/config_routes");
var departureRouter = require('./feature/departures/departures_routes');

var app = express();

/**
 * Enable CORS
 */
const enableCors = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET");
  next();
};

app.use(enableCors);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/agenda', agendaRouter);
app.use("/config", configRouter);
app.use('/departures', departureRouter);

module.exports = app;
