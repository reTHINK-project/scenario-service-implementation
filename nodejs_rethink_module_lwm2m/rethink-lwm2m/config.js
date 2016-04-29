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
            name: 'room1',
            isBooked: false,
            members: []
        },
        {
            name: 'room3',
            isBooked: true,
            members: []
        }
    ],
    devices: [
        {
            room: 'room2',
            name: 'myHeating'
        },
        {
            room: 'room1',
            name: 'myLight'
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