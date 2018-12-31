Dashday Backend
===

Configuration
---

Place a file `app-config.json` to the backend root directory.

The file contents should specify the resources where to get data
for the dashboard. Replace the sensitive bits with your own secrets.

```$json
{
  "departures": {
    "url": "https://aikataulut.tampere.fi",
    "stopName": "Kotikatu 123",
    "config": {
      "stop": 9999,
      "mobile": 1,
      "key": null,
      "showLines": null
    }
  },
  "agendas": {
    "child1": {
      "url": "https://wilma.kaupunki.fi/schedule/export/students/99999/Wilma.ics",
      "token": "TOKEN_HERE",
      "p": 0,
      "f": 100
    },
    "child2": {
      "url": "https://wilma.kaupunki.fi/schedule/export/students/99999/Wilma.ics",
      "token": "TOKEN HERE",
      "p": 0,
      "f": 100
    }
  }
}

```

Calendar resources
---

Instead of getting the calendar data from the resources in the Internet
too often, you can set up a cron script to get the data from the resource
e.g. once per week and save them to a file in the backend root directory.
The file names should match the keys in the agendas object, e.g.
`child1.dat`. If you decide to use the `.dat` files, modify the source
file `feature/agenda/agenda_service.js` accordingly to export the
function `getAgendaMock` as the main service function.