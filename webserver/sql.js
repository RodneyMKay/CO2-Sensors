const sqlite = require('sqlite3');

const config = require('./config.json');

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
 * Utility method for database operations. Prepares the specified statement and executes it by binding the parameters,
 * specified as the inner arrays from batch. Promise is resolved when all operations complete successfully and returns
 * nothing. If any statement fails, the promise is rejected.
 *
 * @param sql sql statement to use for this query
 * @param batch two dimensional array of every row of data to be bound to the statement
 * @returns {Promise<void>} promise that succeeds or fails with an error
 */
async function updateBatch(sql, batch) {
    return new Promise((resolve, reject) => {
        const statement = db.prepare(sql);
        let count = batch.length;

        batch.forEach(row => {
            statement.all(row, err => {
                if (err) reject(err);
                else {
                    count--;
                    if (count === 0) {
                        resolve();
                    }
                }
            })
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

/**
 * Utility method for database operations. Prepares and executes the specified sql statement. The specified params
 * are bound to the statement. This method is for inserting new data into a database or deleting them. The object
 * resulting from the promise represents the last updated row id.
 *
 * @param sql sql statement to use for this query
 * @param params parameters bound to the sql statement
 * @returns {Promise<int>} object describing the fetched row
 */
function updateOne(sql, ...params) {
    return new Promise((resolve, reject) => {
        const statement = db.prepare(sql);
        statement.run(params, err => {
            if (err) reject(err);
            else resolve(statement.lastID);
        });
    });
}

module.exports = {
    init: function () {
        db = new sqlite.Database(config.databaseFile);
    },
    createTables: function () {
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(128) NOT NUll, password VARCHAR(128) NOT NULL, permissions INTEGER)");
            db.run("CREATE TABLE IF NOT EXISTS client (id INTEGER PRIMARY KEY AUTOINCREMENT, mqttId INTEGER, name VARCHAR(256) NOT NULL)");
            db.run("CREATE TABLE IF NOT EXISTS sensor (id INTEGER PRIMARY KEY AUTOINCREMENT, clientId INTEGER, sensorType INTEGER, valueType INTEGER)");
            db.run("CREATE TABLE IF NOT EXISTS data (sensorId INTEGER, time INTEGER, value FLOAT, PRIMARY KEY(sensorId, time))");
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
    createTestData: async function() {
        const clients = [
            [8, 'nicht Zugewiesen1'],
            [9, 'nicht Zugewiesen2'],
            [10, '204 oben'],
            [11, 'A204 unten'],
            [12, 'nicht Zugewiesen3']
        ];

        await updateBatch("INSERT INTO client (mqttId, name) VALUES (?, ?)", clients);

        const sensors = [
            [3, 1, 1],
            [3, 1, 2],
            [4, 3, 3],
            [4, 3, 4],
            [4, 3, 5],
            [4, 3, 6],
            [4, 3, 7]
        ];

        await updateBatch("INSERT INTO sensor (clientId, sensorType, valueType) VALUES (?, ?, ?)", sensors);

        const users = [
            ["test", "test", 127]
        ]

        await updateBatch("INSERT INTO user (username, password, permissions) VALUES (?, ?, ?)", users);
    },
    // ----------------------
    // User
    getUser: function (username) {
        return queryOne("SELECT * FROM user WHERE username = ?", username);
    },
    // ----------------------
    // Client
    listClients: function () {
        return queryMultiple("SELECT * FROM client");
    },
    getClient: function (clientId) {
        return queryOne('SELECT * FROM client WHERE id = ?', clientId);
    },
    addClient: async function (mqttId, name) {
        return await updateOne('INSERT INTO client (mqttId, name) VALUES (?, ?)', mqttId, name);
    },
    getClientId: function (mqttId) {
        return queryOne('SELECT id FROM client WHERE mqttId = ?', mqttId)
            .then(row => (row === null ? null : row.id));
    },
    updateClient: function (clientId, mqttId, name) {
        return updateOne('UPDATE client SET mqttId = ?, name = ? WHERE id = ?', mqttId, name, clientId);
    },
    deleteClient: function (clientId) {
        return updateOne('DELETE FROM client WHERE id = ?', clientId);
    },
    // ----------------------
    // Sensor
    listSensors: function (clientId) {
        return queryMultiple('SELECT * FROM sensor WHERE clientId = ?', clientId);
    },
    getSensor: function (sensorId) {
        return queryOne('SELECT * FROM sensor WHERE id = ?', sensorId);
    },
    addSensor: async function (clientId, sensorType, valueType) {
        return await updateOne('INSERT INTO sensor (clientId, sensorType, valueType) VALUES (?, ?, ?)', clientId, sensorType, valueType);
    },
    getSensorId: function (clientId, sensorType, valueType) {
        return queryOne('SELECT id FROM sensor WHERE clientId = ? AND sensorType = ? AND valueType = ?', clientId, sensorType, valueType)
            .then(row => (row === null ? null : row.id));
    },
    updateSensor: function (sensorId, clientId, sensorType, valueType) {
        return updateOne('UPDATE sensor SET clientId = ?, sensorType = ?, valueType = ? WHERE id = ?', clientId, sensorType, valueType, sensorId);
    },
    deleteSensor: function (sensorId) {
        return updateOne('DELETE FROM sensor WHERE id = ?', sensorId);
    },
    // ----------------------
    // Data
    getData: function (sensorId, from, to) {
        return queryMultiple('SELECT time, value FROM data WHERE sensorId = ? AND time >= ? AND time <= ?', sensorId, from, to);
    },
    insertData: async function (sensorId, value) {
        await queryOne('INSERT INTO data (sensorId, time, value) VALUES (?, ?, ?)', sensorId, Date.now(), value)
    }
}
