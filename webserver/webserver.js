const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite = require('sqlite3');
const config = require('./config');

const app = express();
const db = new sqlite.Database(config.databaseFile);

app.use('/api', bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../webinterface/dist/')))

app.get('/api', (req, res) => {
    res.json({'status':'All systems operational!'});
});

app.post('/api/login', (req, res) => {
    if (req.body.username && req.body.password) {
        const stmt = db.prepare('SELECT * FROM users WHERE usernme = ?')
        stmt.all(req.body.username, () => {

        });
    } else {
        res.json({'error':'Parameters missing!'});
    }
});

module.exports = function () {
    db.serialize(function() {
        db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR NOT NUll, password VARCHAR, permissionLevel INTEGER)");
    });

    app.listen(config.port, () => {
        console.log(`Example app listening at http://localhost:${config.port}`);
    });
}
