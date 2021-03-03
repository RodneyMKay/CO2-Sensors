const mqttInterface = require('./mqttInterface');
const webserver = require('./webserver');

console.log('[*] Starting MQTT interface...');

mqttInterface()

console.log('[*] Starting webserver...');

webserver()

console.log('[*] CO2-Sensor project server running!');
