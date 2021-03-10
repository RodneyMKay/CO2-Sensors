const mqttInterface = require('./mqttInterface');
const webserver = require('./webserver');
const sql = require('./sql');

console.log('[*] Setting up database...');

sql.init();
//sql.deleteTables();
sql.createTables();
//sql.createTestData().catch(error => console.log("[WARN] Couldn't create test data: " + error)); // TODO: remove

console.log("[*] Database ready!");

mqttInterface.start().then(() => {
    console.log('[*] MQTT interface started!');
});

webserver.start().then(port => {
    console.log(`[*] CO2-Sensor project server running on port ${port}!`);
});
