const mqtt = require('mqtt');
const cryptoJS = require('crypto-js');

const constants = require('./constants');
const config = require('./config');
const credentials = require('./credentials');
const sql = require('./sql');

async function handleMessage(topic, message) {
    const splitTopic = topic.split('/');

    if (splitTopic.length !== 4 || splitTopic[0] !== 'nodes') return;

    const clientId = await sql.getClientId(splitTopic[1]);

    if (!clientId) {
        console.log('[WARN] Received unknown clientId: ' + clientId);
        return;
    }

    const sensorType = findSensorType(splitTopic[2]);

    if (!sensorType) {
        console.log('[WARN] Received unknown sensorType: ' + sensorType);
        return;
    }

    const valueType = findValueType(splitTopic[3]);

    if (!valueType) {
        console.warn('[WARN] Received unknown value type: ' + valueType);
        return;
    }

    const data = parseFloat(validateMessage(message));

    if (!data) {
        console.log("[WARN] Invalid data received: " + data);
        return;
    }

    const sensorId = await sql.getSensorId(clientId, sensorType, valueType);

    await sql.insertData(sensorId, data);
}

function findSensorType(typeName) {
    let sensorTypeId = null;

    for (const [key, value] of Object.entries(constants.sensorTypes)) {
        if (value.toLowerCase() === typeName.toLowerCase()) {
            sensorTypeId = key;
        }
    }
}

function findValueType(valueTypeName) {
    let valueTypeId = null;

    for (const [key, value] of Object.entries(constants.valueTypes)) {
        if (value.toLowerCase() === valueTypeName.toLowerCase()) {
            valueTypeId = key;
        }
    }
}

function validateMessage(message) {
    const splitMessage = message.split('$');

    if (splitMessage.length === 2) {
        const data = splitMessage[0];
        const hash = splitMessage[1];

        if (hash === cryptoJS.HmacSHA256(data, credentials.sha256hmacSecret).toString()) {
            return message;
        }
    }

    return null;
}

module.exports = {
    start: function () {
        return new Promise(resolve => {
            const client = mqtt.connect('mqtt:' + config.brokerAddress);

            client.on('connect', () => {
                client.subscribe('nodes/#');
                resolve();
            });

            client.on('message', handleMessage);
        });
    }
}
