const sqlite = require('sqlite3');

const config = require('./config');

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
    createTestData: async function() {
        const clients = [
            [8, 'A204'],
            [9, 'A205'],
            [10, 'A206'],
            [11, 'A207'],
            [12, 'A208']
        ];

        await updateBatch("INSERT INTO client (mqttId, name) VALUES (?, ?)", clients);

        const sensors = [
            [1, 1, 0],
            [1, 1, 1],
            [1, 2, 2],
            [1, 2, 3],
            [1, 2, 4],
            [2, 1, 0]
        ];

        await updateBatch("INSERT INTO sensor (clientId, sensorType, unit) VALUES (?, ?, ?)", sensors);
    },
    getUser: function (username) {
        return queryOne("SELECT * FROM user  WHERE username = ?", username);
    },
    listClients: function () {
        return queryMultiple("SELECT * FROM client");
    },
    getClientId: function (mqttId) {
        return queryOne('SELECT id FROM client WHERE mqttId = ?', mqttId)
            .then(row => (row === null ? null : row.id));
    },
    getSensorId: function (clientId, sensorType, unit) {
        return queryOne('SELECT id FROM sensor WHERE clientId = ? AND sensorType = ? AND unit = ?', clientId, sensorType, unit)
            .then(row => (row === null ? null : row.id));
    },
    insertData: async function (sensorId, time, value) {
        await queryOne('INSERT INTO data (sensorId, time, value) VALUES (?, ?, ?)', sensorId, time, value)
    }
}
