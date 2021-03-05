const sqlite = require('sqlite3');

const config = require('./config');
const constants = require('./constants');

let db = null;

/**
 * Utility method for database operations. Prepares and executes the specified sql statement. The specified params
 * are bound to the statement. The array resulting from the promise contains objects that represents each consecutive
 * row returned by the query. When no results are found an empty array is returned.
 *
 * @param sql sql statement to use for this query
 * @param params parameters bound to the sql statement
 * @returns {Promise<Array>} array of objects containing the fetched rows
 */
function queryMultiple(sql, ...params) {
    return new Promise((resolve, reject) => {
        db.prepare(sql).all(params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

/**
 * Utility method for database operations. Prepares and executes the specified sql statement. The specified params
 * are bound to the statement. The object resulting from the promise represents the row found by this statement.
 * If no row is found, null is returned. If multiple are found, the promise is rejected.
 *
 * @param sql sql statement to use for this query
 * @param params parameters bound to the sql statement
 * @returns {Promise<Object>} object describing the fetched row
 */
async function queryOne(sql, ...params) {
    return queryMultiple(sql, params).then(rows => {
        return new Promise((resolve, reject) => {
            if (rows.length > 1) reject("Multiple results returned! (expected one)");
            else resolve(rows.length === 0 ? null : rows[0]);
        })
    });
}

module.exports = {
    init: function () {
        db = new sqlite.Database(config.databaseFile);
    },
    createTables: function () {
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS client (id INTEGER PRIMARY KEY AUTOINCREMENT, mqttID INTEGER, name VARCHAR(256))");
            db.run("CREATE TABLE IF NOT EXISTS sensor (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(256))");
            db.run("CREATE TABLE IF NOT EXISTS client_sensor (csid INTEGER PRIMARY KEY AUTOINCREMENT, clientId INTEGER, sensorId INTEGER, valueType INTEGER)");
            db.run("CREATE TABLE IF NOT EXISTS data (csid INTEGER, time DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')), value FLOAT, PRIMARY KEY(csid, time))");
            db.run("CREATE TABLE IF NOT EXISTS user (userid INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR NOT NUll, password VARCHAR, permissionLevel INTEGER)");
        });
        this.createTestData(); // TODO: remove
    },
    createTestData: function() {
        let sensors = ['CCS811', 'BME280', 'BME680'];
        let clients = [
            {"mqttID": 8, "name": "A204"},
            {"mqttID": 9, "name": "A205"},
            {"mqttID": 10, "name": "A206"},
            {"mqttID": 11, "name": "A207"},
            {"mqttID": 12, "name": "A208"},
        ];
        let clients_sensors = [
            {clientId: 1, sensorId: 1, valueType: 0},
            {clientId: 1, sensorId: 1, valueType: 1},
            {clientId: 1, sensorId: 2, valueType: 2},
            {clientId: 1, sensorId: 2, valueType: 3},
            {clientId: 1, sensorId: 2, valueType: 4},
            {clientId: 2, sensorId: 1, valueType: 0},
        ];

        db.serialize(() => {
            db.run("DELETE FROM sensor WHERE 1=1");
            db.run("UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'sensor'");

            sensors.forEach((sensor) => {
                db.run("INSERT INTO sensor (name) VALUES ('" + sensor + "')");
            })


            db.run("DELETE FROM client WHERE 1=1");
            db.run("UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'client'");
            clients.forEach((client) => {
                db.run("INSERT INTO client (mqttId, name) VALUES ('" + client.mqttID + "', '" + client.name + "')");
            })

            db.run("DELETE FROM client_sensor WHERE 1=1");
            db.run("UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'client_sensor'");
            clients_sensors.forEach((client_sensor) => {
                db.run("INSERT INTO client_sensor (clientId, sensorId, valueType) VALUES ('" +
                    client_sensor.clientId + "', '" +
                    client_sensor.sensorId + "','" +
                    client_sensor.valueType + "')");
            })
        });
    },
    getUser: function (username) {
        return queryOne("SELECT * FROM user  WHERE username = ?", username);
    },
    listClients: function () {
        return queryMultiple("SELECT * FROM client");
    },
    listSensors: async function () {
        return queryMultiple("SELECT * FROM sensor");
    },
    getCSID: function (clientId, sensorId, valueType) {
        return queryOne('SELECT csid FROM client_sensor WHERE clientId = ? AND sensorId = ? AND valueType = ?', clientId, sensorId, valueType)
            .then(row => row.csid);
    }
}
