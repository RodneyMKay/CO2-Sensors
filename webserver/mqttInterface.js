const mqtt = require('mqtt');
const cryptoJS = require('crypto-js');

const secrets = require('./secrets')

brokerAddr = "10.5.1.100:1883";

const client = mqtt.connect('mqtt:' + brokerAddr);

function checkHMACMessage(data, hmac, secret) {
    return hmac === cryptoJS.HmacSHA256(data, secret).toString();
}

client.on('connect', () => {
    client.subscribe('nodes/#')
});

client.on('message', (topic, message) => {
    let splittopic = topic.split("/");
    let splitmessage = message.toString().split("$");

    if (splitmessage.length === 2 && splittopic.length === 4) {
        if (checkHMACMessage(splitmessage[0], splitmessage[1], secrets.sha256hmacSecret)) {
            console.log(topic + ": " + message + " VALID");
        } else {
            console.log(topic + ": " + message + " INVALID");
        }

    }
});
