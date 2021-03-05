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
    return queryMultiple(sql, ...params).then(rows => {
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
            db.run("CREATE TABLE IF NOT EXISTS user (userid INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(128) NOT NUll, password VARCHAR(128) NOT NULL, permissions INTEGER)");
            db.run("CREATE TABLE IF NOT EXISTS client (id INTEGER PRIMARY KEY AUTOINCREMENT, mqttId INTEGER, name VARCHAR(256) NOT NULL)");
            db.run("CREATE TABLE IF NOT EXISTS sensor (id INTEGER PRIMARY KEY AUTOINCREMENT, clientId INTEGER, sensorType INTEGER, unit INTEGER)");
            db.run("CREATE TABLE IF NOT EXISTS data (sensorId INTEGER, time DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')), value FLOAT, PRIMARY KEY(sensorId, time))");
        });
    },
    deleteTables: function () {
        db.serialize(() => {
            db.run("DROP TABLE IF EXISTS user");
            db.run("DROP TABLE IF EXISTS client");
            db.run("DROP TABLE IF EXISTS sensor");
            db.run("DROP TABLE IF EXISTS data");
        });
    },
    createTestData: function() {
        const clients = [
            {mqttId: 8, name: "A204"},
            {mqttId: 9, name: "A205"},
            {mqttId: 10, name: "A206"},
            {mqttId: 11, name: "A207"},
            {mqttId: 12, name: "A208"},
        ];

        db.serialize(() => {
            clients.forEach(client => {
                queryOne("INSERT INTO client (mqttId, name) VALUES (?, ?)", client.mqttId, client.name);
            });
        });

        const sensors = [
            {clientId: 1, sensorType: 1, unit: 0},
            {clientId: 1, sensorType: 1, unit: 1},
            {clientId: 1, sensorType: 2, unit: 2},
            {clientId: 1, sensorType: 2, unit: 3},
            {clientId: 1, sensorType: 2, unit: 4},
            {clientId: 2, sensorType: 1, unit: 0},
        ];

        db.serialize(() => {
            sensors.forEach(sensor => {
                // TODO: Create a update multiple function to facilitate batch insertion
                queryOne("INSERT INTO sensor (clientId, sensorType, unit) VALUES (?, ?, ?)", sensor.clientId, sensor.sensorType, sensor.unit);
            });
        });
    },
    getUser: function (username) {
        return queryOne("SELECT * FROM user  WHERE username = ?", username);
    },
    listClients: function () {
        return queryMultiple("SELECT * FROM client");
    },
    listSensors: async function () {
        return constants.sensorTypes;
    },
    getCSID: function (clientId, sensorId, valueType) { // TODO: REDO
        return queryOne('SELECT csid FROM client_sensor WHERE clientId = ? AND sensorId = ? AND valueType = ?', clientId, sensorId, valueType)
            .then(row => {
                if (row === null) return null;

                return row.csid;
            });
    },
    insertData: function (mqttId, sensorType, valueType,  data) { // TODO: REDO
        console.log(mqttId + " " + sensorType + " " + valueType + " " + data);
        let sensorTypeId = -1;
        for (const [key, value] of Object.entries(constants.sensorTypes)) {
            if (value.toLowerCase() === sensorType.toLowerCase()) {
                sensorTypeId = key;
            }
        }
        if (sensorTypeId === -1) {
            console.log("[WARN] SensorType '" + sensorType + "' is not supported!");
            return null;
        }

        let valueTypeId = -1
        for (const [key, value] of Object.entries(constants.valueTypeIds)) {
            if (value.toLowerCase() === valueType.toLowerCase()) {
                valueTypeId = key;
            }
        }
        if (valueTypeId === -1) {
            console.log("[WARN] ValueType '" + valueType + "' is not defined!");
            return null;
        }

        queryMultiple("SELECT id FROM client WHERE mqttID = ?", mqttId).then((res) => {
            if (res != null) {
                let clientId = res[0].id;
                this.getCSID(clientId, sensorTypeId, valueTypeId).then((res) => {
                    console.log("csid: " + res);

                    if (true ||res != null) {
                        queryMultiple("INSERT INTO data (csid, value) VALUES (?, ?)", 1, data).then();
                        // queryMultiple("INSERT INTO data (csid, value) VALUES (?, ?)", res[0].csid, data);
                    } else {
                        console.log("[WARN] SensorValue '" + valueType + "' of '" + sensorType + "'is not defined");
                    }
                });
            } else {
                console.log("[WARN] mqttId '" + mqttId + "' is not registered");
            }
        });
    }
}
