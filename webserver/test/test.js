const Influx = require('influxdb-nodejs');
const http = require('http');
const os = require('os');

const client = new Influx('http://10.5.1.100:8086/sensors');


console.log(client.query('10')
    .where('CCS811/TVOC', '450')
    .addFunction('count', 'url')
    .then(console.info)
    .catch(console.error));


