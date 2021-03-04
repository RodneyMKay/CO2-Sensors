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
            db.run("CREATE TABLE IF NOT EXISTS data (csid INTEGER, time DATE, serverId INTEGER, valueType INTEGER, PRIMARY KEY(csid, time))");
            db.run("CREATE TABLE IF NOT EXISTS user (userid INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR NOT NUll, password VARCHAR, permissionLevel INTEGER)");
        });
    },
    getUser: function (username) {
        return queryOne("SELECT * FROM user WHERE username = ?", username);
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
