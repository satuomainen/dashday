const express = require('express');
const router = express.Router();
const routeCache = require('route-cache');

const Constants = require("../../common/constants");
const departureService = require("./departures_service");

router.get('/', routeCache.cacheSeconds(Constants.DEPARTURES_REFRESH_TIME), function(req, res, next) {
  departureService.getNextDepartures()
    .then(departures => res.send(departures))
    .catch(() => res.sendStatus(500));
});

module.exports = router;
