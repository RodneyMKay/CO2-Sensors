const mqtt = require('mqtt');
const cryptoJS = require('crypto-js');

const credentials = require('./credentials')
const config = require('./config')

function checkHMACMessage(data, hmac, secret) {
    return hmac === cryptoJS.HmacSHA256(data, secret).toString();
}

module.exports = function () {
    const client = mqtt.connect('mqtt:' + config.brokerAddress);

    client.on('connect', () => {
        client.subscribe('nodes/#')
    });

    client.on('message', (topic, message) => {
        let splittopic = topic.split("/");
        let splitmessage = message.toString().split("$");

        if (splitmessage.length === 2 && splittopic.length === 4) {
            if (checkHMACMessage(splitmessage[0], splitmessage[1], credentials.sha256hmacSecret)) {
                console.log(topic + ": " + message + " VALID");
            } else {
                console.log(topic + ": " + message + " INVALID");
            }

        }
    });
}
