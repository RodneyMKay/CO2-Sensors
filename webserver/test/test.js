const Influx = require('influxdb-nodejs');
const http = require('http');
const os = require('os');

const client = new Influx('http://10.5.1.100:8086/sensors');


client.showDatabases().then((databases) => {
    console.log("Databases: " + databases);
});



client.query('10')
    //.where('CCS811/eCO2ppm', '400.0000000000')
    .then((results) => {
        results.results.forEach((result) => {
            console.log("statementID: " + result.statement_id);
            if (result.series) {
                console.log("Rows: " + result.series[0].values.length);
                console.log("Columns: " + result.series[0].columns);
                console.log("First Data Row: " + result.series[0].values[0])
                console.log();
            } else {
                console.log("No result");
            }
        });
    })
    .catch(console.error);
