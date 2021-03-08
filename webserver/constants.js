module.exports = {
    sensorTypes: {
        1: "CCS811",
        2: "BME280",
        3: "BME680"
    },
    valueTypes: {
        0: "eCO2ppm",
        1: "TVOC",
        2: "iaq",
        3: "temp",
        4: "hum",
        5: "pressure",
        6: "gas"
    },
    permission: {
        manageClients: 0x01,
        manageSensors: 0x02,
        manageUsers: 0x04,
        globalSettings: 0x08
    }
}
