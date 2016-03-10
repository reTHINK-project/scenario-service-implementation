var config = {};

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
            name: 'Room 1',
            isBooked: false,
            devices: [],
            members: []
        },
        {
            name: 'Room 2',
            isBooked: true,
            devices: [],
            members: []
        }
    ],
    devices: [
        {
            name: 'myHeating'
        },
        {
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