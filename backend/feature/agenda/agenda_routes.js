const express = require("express");
const routeCache = require("route-cache");

const Constants = require("../../common/constants");
const agendaService = require("./agenda_service");

const router = express.Router();

router.get('/:agendaId', routeCache.cacheSeconds(Constants.CALENDAR_REFRESH_TIME), function(req, res) {
  const agendaId = req.params.agendaId;
  const { date } = req.query;
  agendaService
    .getAgenda(agendaId, date)
    .then(agenda => res.send(agenda))
    .catch(() => res.sendStatus(404));
});

module.exports = router;
