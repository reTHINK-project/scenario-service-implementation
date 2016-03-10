'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _logops = require('logops');

var _logops2 = _interopRequireDefault(_logops);

var _lwm2mNodeLib = require('lwm2m-node-lib');

var _lwm2mNodeLib2 = _interopRequireDefault(_lwm2mNodeLib);

var _Database = require('./Database');

var _Database2 = _interopRequireDefault(_Database);

var _Hotel = require('./models/Hotel');

var _Hotel2 = _interopRequireDefault(_Hotel);

var _Device = require('./models/Device');

var _Device2 = _interopRequireDefault(_Device);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'use strict';

var lwm2m = {};
lwm2m.server = _lwm2mNodeLib2.default.server; //Enables use of all native lwm2m-lib methods
lwm2m.serverInfo = {};
var config = {};
var database = undefined;

lwm2m.setConfig = function (c) {
    config = c;

    if (config.server.logLevel) {
        _logops2.default.setLevel(config.server.logLevel);
    }
};

lwm2m.getConfig = function () {
    return config;
};

//TODO: Promises
lwm2m.start = function (callback) {
    if (typeof config === 'undefined') {
        _logops2.default.error("Missing configuration!");
    }

    database = new _Database2.default(config.db.host, config.db.database);

    database.connect(function (error) {
        if (error) {
            return callback(error);
        }
        database.isInitialised(function (initialised, err) {
            if (err) {
                _logops2.default.error(err);
            } else {
                if (!initialised) {
                    database.createHotel(config.hotel, function (error) {
                        if (error) {
                            _logops2.default.error(error);
                            return callback(error);
                        }

                        _logops2.default.info("Database initialised with config-data! Ready to start.");
                    });
                } else {
                    _logops2.default.info("Database already initialised. Using existing data.");
                }
            }

            lwm2m.server.start(config.server, function (error, results) {
                if (error) {
                    return callback(error);
                }
                lwm2m.serverInfo = results;
                setHandlers(function () {
                    _logops2.default.info("Initialised registration handlers");
                    callback();
                });
            });
        });
    });
};

lwm2m.stop = function (callback) {
    database.disconnect(function (error) {
        if (error) {
            _logops2.default.error(error);
        }
    });

    if (!lwm2m.serverInfo) {
        var error = "Can't stop server. Not running";
        _logops2.default.error(error);
        return callback(error);
    }

    lwm2m.server.stop(lwm2m.serverInfo, function (error) {
        callback(error);
    });
};

//TODO: Update references
function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    _logops2.default.info('\nDevice registration:\n----------------------------\n');
    _logops2.default.info('Endpoint name: %s\nLifetime: %s\nBinding: %s', endpoint, lifetime, binding);

    database.registerDevice(endpoint, true, function (error) {
        if (error) {
            _logops2.default.error("Error while updating device-data");
        }
        _logops2.default.debug("Device info for '%s' stored in db.", endpoint);

        callback();
    });
}

//TODO: Update references
function unregistrationHandler(device, callback) {
    _logops2.default.info('\nDevice unregistration:\n----------------------------\n');
    _logops2.default.info('Device location: %s', device.name);

    database.registerDevice(device.name, false, function (error) {
        if (error) {
            _logops2.default.error("Error while updating device-data", error);
        }
        _logops2.default.debug("Device info for '%s' stored in db.", device.name);

        callback();
    });
}

function setHandlers(callback) {
    lwm2m.server.setHandler(lwm2m.serverInfo, 'registration', registrationHandler);
    lwm2m.server.setHandler(lwm2m.serverInfo, 'unregistration', unregistrationHandler);
    callback();
}

exports.default = lwm2m;
//# sourceMappingURL=index.js.map