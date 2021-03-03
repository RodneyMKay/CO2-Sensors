const mqttInterface = require('./mqttInterface');
const webserver = require('./webserver');
const sql = require('./sql');

console.log('[*] Setting up database...');

sql.init();
sql.createTables();

console.log("[*] Database ready!");

mqttInterface.start().then(() => {
    console.log('[*] MQTT interface started!');
});

webserver.start().then(port => {
    console.log(`[*] CO2-Sensor project server running on port ${port}!`);
});
