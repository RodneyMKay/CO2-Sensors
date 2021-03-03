const sqlite = require('sqlite3');
const config = require('./config')

let db = null;

module.exports = {
    init: function () {
        db = new sqlite.Database(config.databaseFile);
    }
}
