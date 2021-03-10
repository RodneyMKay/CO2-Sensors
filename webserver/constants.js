module.exports = {
    sensorTypes: {
        1: "CCS811",
        2: "BME280",
        3: "BME680"
    },
    valueTypes: {
        1: "eCO2ppm", // TODO change eCO2ppm to CO2 when arduinos have the new firmware with these valueTypes
        2: "TVOC",
        3: "iaq",
        4: "temp",
        5: "hum",
        6: "pressure",
        7: "gas"
    },
    permission: {
        manageClients: 0x01,
        manageSensors: 0x02,
        manageUsers: 0x04,
        globalSettings: 0x08
    }
}
