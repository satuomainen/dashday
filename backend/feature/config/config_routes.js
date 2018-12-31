const express = require('express');
const router = express.Router();
const routeCache = require('route-cache');

const configService = require("./config_service");
const Constants = require("../../common/constants");

router.get("/", routeCache.cacheSeconds(Constants.CONFIG_REFRESH_TIME), function(req, res, next) {
  res.send(configService.getConfig());
});

module.exports = router;
