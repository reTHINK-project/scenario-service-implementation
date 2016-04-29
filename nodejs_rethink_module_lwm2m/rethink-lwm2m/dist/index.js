/*
 * Copyright [2015-2017] Fraunhofer Gesellschaft e.V., Institute for
 * Open Communication Systems (FOKUS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

var _lwm2mNodeLib = require("lwm2m-node-lib");

var _lwm2mNodeLib2 = _interopRequireDefault(_lwm2mNodeLib);

var _Database = require("./Database");

var _Database2 = _interopRequireDefault(_Database);

var _HTTPInterface = require("./HTTPInterface");

var _HTTPInterface2 = _interopRequireDefault(_HTTPInterface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lwm2m = {};
lwm2m.server = _lwm2mNodeLib2.default.server; //Enables use of all native lwm2m-lib methods
lwm2m.serverInfo = {};
var config = {};
var database = void 0;
var httpInterface = void 0;

_logops2.default.format = _logops2.default.formatters.dev;

lwm2m.setConfig = function (c) {
    config = c;

    if (config.server.logLevel) {
        _logops2.default.setLevel(config.server.logLevel);
    }
};

lwm2m.getConfig = function () {
    return config;
};

lwm2m.start = function () {
    return new Promise(function (resolve, reject) {
        if (typeof config === 'undefined') {
            _logops2.default.error("Missing configuration!");
            reject();
        }
        initdb().catch(reject).then(function () {
            return startm2m();
        }).catch(reject).then(function () {
            return initHTTP();
        }).catch(reject).then(resolve);
    });
};

function initdb() {
    return new Promise(function (resolve, reject) {
        database = new _Database2.default(config);
        database.connect().catch(function (error) {
            _logops2.default.error(error);
            reject(error);
        }).then(function () {
            return database.isInitialised();
        }).catch(function (error) {
            _logops2.default.error(error);
            reject(error);
        }).then(function (initialised) {
            if (!initialised) {
                database.createHotel().catch(function (error) {
                    _logops2.default.error(error);
                    reject(error);
                }).then(function (errors) {
                    if (errors) {
                        _logops2.default.error("Problems while initialising db: ", errors);
                    } else {
                        _logops2.default.info("Database initialised with config-data!");
                    }
                    resolve();
                });
            } else {
                _logops2.default.info("Database already initialised. Using existing data.");
                resolve();
            }
        });
    });
}

function startm2m() {
    return new Promise(function (resolve, reject) {
        lwm2m.server.start(config.server, function (error, results) {
            if (error) {
                _logops2.default.error(error);
                reject(error);
            } else {
                lwm2m.serverInfo = results;
                setHandlers().then(resolve);
            }
        });
    });
}

lwm2m.stop = function () {
    return new Promise(function (resolve, reject) {
        if (!lwm2m.serverInfo) {
            //If server not running, abort.
            reject(error);
        }
        httpInterface.close().catch(function (error) {
            _logops2.default.error("Error while closing httpInterface!", error);
        }).then(function () {
            _logops2.default.debug("Closed http-interface");
        });
        database.disconnect().catch(function (error) {
            _logops2.default.error("Error while disconnecting from db!", error);
        }).then(function () {
            _logops2.default.debug("Disconnected from db");
        });
        lwm2m.server.stop(lwm2m.serverInfo, function (error) {
            //TODO: Observes somehow do not stop on lwm2m.server stop
            if (error) {
                reject(error);
            } else {
                _logops2.default.debug("Stopped lwm2m");
                resolve();
            }
        });
    });
};

function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    _logops2.default.info('\nDevice registration:\n----------------------------\n');
    _logops2.default.info('Endpoint name: %s\nLifetime: %s\nBinding: %s\n Payload: %s', endpoint, lifetime, binding, payload);

    database.registerDevice(endpoint, true, payload).catch(function (error) {
        _logops2.default.error("Error while updating device-data", error);
    }).then(function () {
        //TODO: Make list of objects/resources to observe configurable
        observeDeviceData(endpoint, 3303, 0, 5700); //Temperature
        observeDeviceData(endpoint, 3303, 0, 5701); //Unit

        observeDeviceData(endpoint, 3304, 0, 5700); //Humidity
        observeDeviceData(endpoint, 3304, 0, 5701); //Unit

        //Get list of light-ids
        var lightIdsMatch = new RegExp("<\/3311[\/]([0-9]+)>", "g");
        var lightIds = [];
        var result = null;
        do {
            result = lightIdsMatch.exec(payload);
            if (result != null) {
                lightIds.push(result[1]);
            }
        } while (result != null);
        lightIds.forEach(function (id) {
            observeDeviceData(endpoint, 3311, id, 5850); //Light on/off state
            observeDeviceData(endpoint, 3311, id, 5851); //Light dimmer
            observeDeviceData(endpoint, 3311, id, 5706); //Light colour
            observeDeviceData(endpoint, 3311, id, 5701); //Light colour unit
        });

        callback();
    });
}

function unregistrationHandler(device, callback) {
    _logops2.default.info('\nDevice unregistration:\n----------------------------\n');
    _logops2.default.info('Device location: %s', device.name);

    database.registerDevice(device.name, false).catch(function (error) {
        _logops2.default.error("Error while updating device-data", error);
    }).then(callback);
}

function observeHandler(value, objectType, objectId, resourceId, deviceId) {
    lwm2m.server.getRegistry().get(deviceId, function (error, device) {
        if (error) {
            _logops2.default.error("Error while getting device by id", error);
        } else {
            database.storeValue(device.name, objectType, objectId, resourceId, value).catch(function (error) {
                _logops2.default.error("Error while storing observe-data in db! Device: %s", device.name, error);
            }).then(function () {
                _logops2.default.debug("Stored observe-data for device '%s' in db!", device.name);
            });
        }
    });
    _logops2.default.debug("Observe-handler device [deviceId " + deviceId + ", objectType " + objectType + ", objectId " + objectId + ", resourceId: " + resourceId + "] => " + value);
}

function observeDeviceData(deviceName, objectType, objectId, resourceId) {
    lwm2m.server.getRegistry().getByName(deviceName, function (error, device) {
        if (error) {
            _logops2.default.error(error);
        } else {
            lwm2m.server.observe(device.id, objectType, objectId, resourceId, observeHandler, function (error, value) {
                if (error) {
                    _logops2.default.error("Error while starting observe!", error);
                } else {
                    _logops2.default.debug("Started observe for '%s'. First value: ", deviceName, value);
                    if (value === '') {
                        //No data => Device does not set data
                        _logops2.default.debug("Device '" + deviceName + "' does not set /" + objectType + "/" + objectId + "/" + resourceId + "! Canceling observe.");
                        lwm2m.server.cancelObserver(device.id, objectType, objectId, resourceId, function () {
                            _logops2.default.debug("Observe for '%s' canceled!", device.name);
                        });
                    } else {
                        database.storeValue(deviceName, objectType, objectId, resourceId, value).catch(function (error) {
                            _logops2.default.error("Error while storing initial read-data!", error);
                        }).then(function () {
                            _logops2.default.debug("Stored initial read-data from observe.");
                        });
                    }
                }
            });
        }
    });
}

function setHandlers() {
    return new Promise(function (resolve) {
        lwm2m.server.setHandler(lwm2m.serverInfo, 'registration', registrationHandler);
        lwm2m.server.setHandler(lwm2m.serverInfo, 'unregistration', unregistrationHandler);
        _logops2.default.debug("Set registration handlers.");
        resolve();
    });
}

function initHTTP() {
    return new Promise(function (resolve, reject) {
        if (!config.http.enabled) {
            _logops2.default.debug("httpInterface not enabled");
            resolve();
        } else {
            _logops2.default.debug("Starting HTTP-interface");
            httpInterface = new _HTTPInterface2.default(config.http.host, config.http.port, config.http.key, config.http.cert, database);
            httpInterface.open().catch(function (error) {
                _logops2.default.error("Error while starting HTTP-interface", error);
                reject(error);
            }).then(function () {
                _logops2.default.info("Started HTTP-interface");
                resolve();
            });
        }
    });
}

exports.default = lwm2m;
//# sourceMappingURL=index.js.map