const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const config = require('./config.json');
const constants = require('./constants.json');
const credentials = require('./credentials.json');
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
                res.json({error: {status: error.statusCode, message: error.message}});
            } else {
                res.status(500);
                res.json({error: {status: 500, message: error.toString()}});
            }
        });
    }
}

/**
 * Checks if the request is authorized and throws a HTTPError if it's not. Also checks if the user has the specified
 * permissions. 0 can be used as permissions to only check if the user is logged in.
 */
function requirePermission(req, permissions) {
    if (!req.session.user || !req.session.user.id) {
        throw new HTTPError(401, "You must be logged in to access this resource!");
    }

    if ((req.session.user.permissions & permissions) !== permissions) {
        throw new HTTPError(403, "Your permission level isn't high enough to view this information!");
    }
}

// ----------------------
// Setup server

const app = express();
app.use('/api/v1/*', bodyParser.json());
app.use('/api/v1/*', bodyParser.urlencoded({extended: true}));
app.use('/api/v1/*', session({
    secret: credentials.sessionSecret,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true } - Only enable if ssl is active
}));

// ----------------------
// Static files

app.use('/', express.static(path.join(__dirname, '../webinterface/dist/')));
app.use('/constants.json', express.static('constants.json'));

// ----------------------
// Auth api

app.get('/api/v1/auth/currentUser', handleAsync(async (req, res) => {
    requirePermission(req, 0);
    res.json(req.session.user);
}));

app.post('/api/v1/auth/login', handleAsync(async (req, res) => {
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

app.post('/api/v1/auth/logout', handleAsync(async (req, res) => {
    requirePermission(req, 0);
    const user = req.session.user;
    req.session.user = null;
    res.json(user);
}));

// ----------------------
// Clients

app.get('/api/v1/clients', handleAsync(async (req, res) => {
    res.json(await sql.listClients())
}));

app.post('/api/v1/clients', handleAsync(async (req, res) => {
    requirePermission(req, constants.permission.manageClients);
    const id = await sql.addClient(req.body.mqttId, req.body.name);
    res.json({status: "OK", id: id});
}));

app.get('/api/v1/clients/:clientId', handleAsync(async (req, res) => {
    const client = await sql.getClient(parseInt(req.params.clientId));

    if (client) {
        res.json(client);
    } else {
        throw new HTTPError(404, "Client with the specified id not found!");
    }
}));

app.put('/api/v1/clients/:clientId', handleAsync(async (req, res) => {
    requirePermission(req, constants.permission.manageClients);
    await sql.updateClient(parseInt(req.params.clientId), req.body.mqttId, req.body.name);
    res.json({status: "OK"});
}));

app.delete('/api/v1/clients/:clientId', handleAsync(async (req, res) => {
    requirePermission(req, constants.permission.manageClients);
    await sql.deleteClient(parseInt(req.params.clientId));
    res.json({status: "OK"});
}));

// ----------------------
// Clients -> Sensors

app.get('/api/v1/clients/:clientId/sensors', handleAsync(async (req, res) => {
    res.json(await sql.listSensors(parseInt(req.params.clientId)));
}));

app.post('/api/v1/sensors', handleAsync(async (req, res) => {
    requirePermission(req, constants.permission.manageSensors);
    const id = await sql.addSensor(req.body.clientId, req.body.sensorType, req.body.valueType);
    res.json({status: "OK", id: id});
}));

app.get('/api/v1/sensors/:sensorId', handleAsync(async (req, res) => {
    const sensor = await sql.getSensor(parseInt(req.params.sensorId));

    if (sensor) {
        res.json(sensor);
    } else {
        throw new HTTPError(404, "Specified sensor cannot be found!");
    }
}));

app.put('/api/v1/sensors/:sensorId', handleAsync(async (req, res) => {
    requirePermission(req, constants.permission.manageSensors);
    await sql.updateSensor(parseInt(req.params.sensorId), req.body.clientId, req.body.sensorType, req.body.valueType);
    res.json({status: "OK"});
}));

app.delete('/api/v1/sensors/:sensorId', handleAsync(async (req, res) => {
    requirePermission(req, constants.permission.manageSensors);
    await sql.deleteSensor(parseInt(req.params.sensorId));
    res.json({status: "OK"});
}));

// ----------------------
// Data

app.get('/api/v1/sensors/:sensorId/data', handleAsync(async (req, res) => {
    const from = new Date(parseInt(req.query.from));
    const to = new Date(parseInt(req.query.to));

    res.json(await sql.getData(req.params.sensorId, from, to));
}));

// ----------------------
// Misc

module.exports = {
    start: function () {
        return new Promise(resolve => {
            app.listen(config.port, () => resolve(config.port));
        });
    }
}
