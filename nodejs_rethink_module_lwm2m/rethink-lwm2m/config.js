var config = {};

//Configuration of HTTP-interface
//--------------------------------------------------
config.http = {
    enabled: true,
    host: 'localhost',
    port: 8000,
    key: './test/cert/rethink-certificate.key',
    cert: './test/cert/rethink-certificate.cert'
};

//Configuration of the database (mongodb)
//--------------------------------------------------
config.db = {
    host: 'localhost',
    port: '27017',
    database: 'rethink-lwm2m'
};

//Configuration of the Hotel
//--------------------------------------------------

config.hotel = {
    name: 'MyHotel',
    groups: [],
    rooms: [
        {
            name: '237',
            wifi: {
                ssid: "237wifi",
                user: "237user",
                password: "237password"
            },
            isBooked: false,
            members: []
        },
        {
            name: '238',
            wifi: {
                ssid: "238wifi",
                user: "238user",
                password: "238password"
            },
            isBooked: true,
            members: []
        }
    ],
    devices: [
        {
            room: '237',
            name: 'myHeating'
        },
        {
            room: '238',
            name: 'myRaspberry'
        }
    ]
};

// Configuration of the LWTM2M Server
//--------------------------------------------------
config.server = {
    port: 5683,                         // Port where the server will be listening
    lifetimeCheckInterval: 1000,        // Minimum interval between lifetime checks in ms
    udpWindow: 100,
    defaultType: 'Device',
    logLevel: 'DEBUG',
    ipProtocol: 'udp4',
    serverProtocol: 'udp4',
    deviceRegistry: {
        type: 'mongodb',
        host: config.db.host,
        port: config.db.port,
        db: 'lwm2m'
    },
    formats: [
        {
            name: 'application-vnd-oma-lwm2m/text',
            value: 1541
        },
        {
            name: 'application-vnd-oma-lwm2m/tlv',
            value: 1542
        },
        {
            name: 'application-vnd-oma-lwm2m/json',
            value: 1543
        },
        {
            name: 'application-vnd-oma-lwm2m/opaque',
            value: 1544
        }
    ],
    writeFormat: 'application-vnd-oma-lwm2m/text'
};

module.exports = config;
