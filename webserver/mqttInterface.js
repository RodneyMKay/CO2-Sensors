const mqtt = require('mqtt');
const cryptoJS = require('crypto-js');

const credentials = require('./credentials')
const config = require('./config')
const sql = require('./sql')

function handleMessage(topic, message) {
    let splittopic = topic.split("/");
    let splitmessage = message.toString().split("$");

    if (splitmessage.length === 2 && splittopic.length === 4) {
        if (checkHMACMessage(splitmessage[0], splitmessage[1], credentials.sha256hmacSecret)) {
            //console.log(topic + ": " + message + " VALID");
            sql.insertData(splittopic[1], splittopic[2], splittopic[3], splitmessage[0]);

        } else {
            //console.log(topic + ": " + message + " INVALID");
        }
    }
}

function checkHMACMessage(data, hmac, secret) {
    return hmac === cryptoJS.HmacSHA256(data, secret).toString();
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
