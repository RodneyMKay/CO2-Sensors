# CO2-Sensors
This is the project that encompasses the [software for the CO2-Sensors](https://github.com/Cast39/FLS-eCO2-Sensor-Firmware) of the Friedrich-List-Schule. This is a mint project created by students to detect bad air in the school rooms and ensure that the windows are opened regularly.

## Project Structure
The CO2-Sensors are implemented through CO2-Sensors hooked up to small arduino boards. Their data is shared through mqtt over w-lan. The data is received by a Node-RED server and stored in influxDB. Prupose of the webinterface is to display the data and make settings. The webinterface is based on vue, vue-bootstrap, express and nodejs. Settings are broadcasted to the arduinos through mqtt directly.

```
.
├── webserver         # Backend server of the webinterface
├── webbinterface     # Frontend of the webinterface
├── LICENSE
└── README
```
