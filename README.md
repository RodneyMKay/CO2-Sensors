# CO2-Sensors
This is the project that encompasses the [software for the CO2-Sensors](https://github.com/Cast39/FLS-eCO2-Sensor-Firmware) of the Friedrich-List-Schule. This is a mint project created by students to detect bad air in the school rooms and ensure that the windows are opened regularly.

Documentation: [GitHub Wiki](https://github.com/RodneyMKay/CO2-Sensors/wiki)

## Building

### Production environment

To build the project, go into the ``webserver`` directory and run:
```
npm run build
```

To start the project, run the following in the same directory:
```
npm run start
```

### Development environment

Running the project in development mode has a few performance deficits. 
The advantage is that things will automatically refresh when files are changed.
To achieve this, we run a vue development server, by running the following command in the ``webinterface`` directory:
```
npm run dev
```

We also need to startup the webserver as the backend though, so that the api is available. 
This is achieved by running the same command in the ``webserver`` folder in a separate terminal as well.
The full development webserver will then be available at ``localhost:3080``.
DO NOT USE PORT 8080, since vue is in static mode there.

## Project Structure
The CO2-Sensors are implemented through CO2-Sensors hooked up to small arduino boards. Their data is shared through mqtt over w-lan. The data is received by a Node-RED server and stored in influxDB. Prupose of the webinterface is to display the data and make settings. The webinterface is based on vue, vue-bootstrap, express and nodejs. Settings are broadcasted to the arduinos through mqtt directly.

```
.
├── webserver         # Backend server of the webinterface
├── webbinterface     # Frontend of the webinterface
├── LICENSE.md
└── README.md
```
