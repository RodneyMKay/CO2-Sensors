const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const credentials = require('./credentials');
const config = require('./config');
const sql = require('./sql');

/**
 * Utility class that can be thrown as an error in a promise of handleAsync(). When the error is caught by handleAsync()
 * the specified statusCode is set as html status code and the specified message is sent to the user in a json encoded
 * form.
 */
class HTTPError {
    constructor(statusCode, message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}

/**
 * Creates a callback function for express.
 *
 * @param handler async handler function for the express app
 * @returns {function(*=, *=): void}
 */
function handleAsync(handler) {
    return function (req, res) {
        handler(req, res).catch(error => {
            if (error instanceof HTTPError) {
                res.status(error.statusCode);
                res.json({error: {code: error.statusCode, message: error.message}});
            } else {
                res.status(500);
                res.json({error: {code: 500, message: error.toString()}});
            }
        });
    }
}

/**
 * Checks if the request is authorized and throws a HTTPError if it's not. Also checks if the user has the specified
 * permissionLevel or greater.
 */
function requirePermission(req, permissionLevel) {
    if (!req.session.user || !req.session.user.id) {
        throw new HTTPError(401, "You must be logged in to access this resource!");
    }

    if (req.session.user.permissionLevel < permissionLevel) {
        throw new HTTPError(403, "Your permission level isn't high enough to view this information!");
    }
}

// ----------------------
// Setup server

const app = express();
app.use('/api/*', bodyParser.json());
app.use('/api/*', bodyParser.urlencoded({extended: true}));
app.use('/api/*', session({
    secret: credentials.sessionSecret,
    resave: false,
    saveUninitialized: true,
//    cookie: { secure: true }
}));

// ----------------------
// Static files

app.use('/', express.static(path.join(__dirname, '../webinterface/dist/')));

// ----------------------
// User api

app.get('/api/user', handleAsync(async (req, res) => {
    requirePermission(req, 1);
    res.json(req.session.user);
}));

app.post('/api/user/login', handleAsync(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        throw new HTTPError(400, "Please specify username and password!");
    }

    const user = await sql.getUser(username);

    if (user && user.password === password) {
        req.session.user = user;
        res.json(user);
    } else {
        throw new HTTPError(403, "Username or password not valid!");
    }
}));

app.post('/api/user/logout', handleAsync(async (req, res) => {
    requirePermission(req, 1);
    const user = req.session.user;
    req.session.user = null;
    res.json(user);
}));


// ----------------------
// Sensors
app.post('/api/sensors/list', handleAsync(async (req, res) => {
    sql.listSensors().then((sensors) => {
        res.json(sensors);
    });
}));

// ----------------------
// Clients
app.post('/api/clients/list', handleAsync(async (req, res) => {
    sql.listClients().then((clients) => {
        res.json(clients);
    });
}));

// ----------------------
// Data


// ----------------------
// Misc

module.exports = {
    start: function () {
        return new Promise(resolve => {
            app.listen(config.port, () => resolve(config.port));
        });
    }
}
