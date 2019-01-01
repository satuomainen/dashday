Dashday - A hall dashboard for kids
===

The Dashday dashboard shows 

* the current time and date, 
* next three bus departures from a given bus stop, and 
* the school timetable.

Technical struture
---

There is a [frontend](frontend/README.md) that shows the view in a browser.

The [backend](backend/README.md) provides the APIs that the frontend needs.
The backend fetches the data from the external resources and transforms it
so that the frontend can easily show it. 

The target for the build is Raspberry Pi but it should work anywhere, there
is nothing Raspberry Pi specific.

Building and installing
---

Clone the repository to the target environment.

The frontend is a simple React app that is built like this:

* `cd frontend`
* `npm install`
* `npm run build`

As a result the production build is created in `frontend/build`. The directory
contents should be copied to the backend `backend/public/` directory.

The backend just needs its dependencies to work, run `npm install`. For
testing purposes the backend can be started with `npm run start`. Before
running, though, check out the backend configuration instructions in
[backend/README.md](backend/README.md).

System integration
---

Make the app start when the OS boots. To achieve this, create the file
`/etc/systemd/system/dashday.service` as:

```
[Unit]
Description=Dashday

[Service]
ExecStart=/usr/bin/node /home/pi/dashday/backend/bin/www
Restart=always
RestartSec=10
Environment=NODE_ENV=production PORT=8081
WorkingDirectory=/home/pi/dashday/backend

[Install]
WantedBy=multi-user.target
```

Then run

* `sudo systemctl daemon-reload`
* `sudo systemctl enable dashday`
* `sudo systemctl start dashday`

Last thing that is needed is to get a browser up and running when the
device starts. Chromium is installed by default and it features a kiosk
mode, which is exactly what we are looking for.

To make Chromium start every time the desktop is loaded, create an autostart
directory (`mkdir -p ~/.config/autostart`). Then create a file
`dashday.desktop` there with the contents:

```
[Desktop Entry]
Name=Dashday
Exec=/usr/bin/chromium-browser --kiosk --incognito http://localhost:8081
Type=application
``` 

(NB! The `--incognito` option is there because it prevents Chromium asking
to restore tabs from previous session.)