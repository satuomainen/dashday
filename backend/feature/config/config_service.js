const appConfig = require("../../app-config");

const getConfig = () => {
  return {
    agendas: Object.keys(appConfig.agendas),
    departures: {
      stopName: appConfig.departures.stopName
    }
  }
};

module.exports = {
  getConfig
};
