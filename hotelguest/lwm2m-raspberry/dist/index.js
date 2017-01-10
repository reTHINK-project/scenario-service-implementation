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

var _lwm2mNodeLib = require("lwm2m-node-lib");

var _lwm2mNodeLib2 = _interopRequireDefault(_lwm2mNodeLib);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

var _commandNode = require("command-node");

var _commandNode2 = _interopRequireDefault(_commandNode);

var _config = require("./../config");

var _config2 = _interopRequireDefault(_config);

var _TempSensor = require("./TempSensor");

var _TempSensor2 = _interopRequireDefault(_TempSensor);

var _Hue = require("./Hue");

var _Hue2 = _interopRequireDefault(_Hue);

var _DoorLock = require("./DoorLock");

var _DoorLock2 = _interopRequireDefault(_DoorLock);

var _lwm2mMapping = require("./lwm2m-mapping");

var _lwm2mMapping2 = _interopRequireDefault(_lwm2mMapping);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_logops2.default.format = _logops2.default.formatters.dev;
_logops2.default.setLevel('INFO'); //Initial log-level, overwritten by config later


var client = _lwm2mNodeLib2.default.client;
var globalDeviceInfo = null;
var tempSensor = null;
var hue = null;
var doorLock = null;

_logops2.default.debug("Initialising from config");
init().catch(function (error) {
    _logops2.default.fatal("Error while initialising! Abort.");
    if (error) {
        _logops2.default.fatal(error);
    }
    process.exit(1);
}).then(function () {
    var timeout_ms = 10000;
    var timeout = setTimeout(function () {
        _logops2.default.info("Timeout: Unable to register to server within " + timeout_ms + "ms!");
        cmd_stop();
    }, timeout_ms);

    _logops2.default.info("Connecting to lwm2m-server [" + _config2.default.connection.host + ":" + _config2.default.connection.port + "] as '" + _config2.default.connection.endpoint + "'");
    register().catch(function (error) {
        _logops2.default.error("Could not connect to server!", error);
        clearTimeout(timeout);
        cmd_stop();
    }).then(function () {
        clearTimeout(timeout);
        _logops2.default.info("Registered at server '" + _config2.default.connection.host + ":" + _config2.default.connection.port + "' as '" + _config2.default.connection.endpoint + "'!");
    });
});

function init() {
    return new Promise(function (resolve, reject) {
        if (!_config2.default || !_config2.default.hasOwnProperty("client") || !_config2.default.hasOwnProperty("connection")) {
            reject(new Error("Invalid configuration! Can't start."));
        } else {
            _logops2.default.setLevel(_config2.default.client.logLevel);

            _logops2.default.info("Initialising client");
            //Init lwm2m-client
            client.init(_config2.default);

            _logops2.default.info("Starting devices");
            //Init devices attached and enabled
            var devices = [];
            if (_config2.default.sensors.hasOwnProperty("temperature") && _config2.default.sensors.temperature.enabled === true) {
                devices.push(initTempSensor());
            } else {
                _logops2.default.debug("Device 'temperature' is disabled");
            }
            if (_config2.default.sensors.hasOwnProperty("hue") && _config2.default.sensors.hue.enabled === true) {
                devices.push(initHue());
            } else {
                _logops2.default.debug("Device 'hue' is disabled");
            }
            if (_config2.default.sensors.hasOwnProperty("doorLock") && _config2.default.sensors.doorLock.enabled === true) {
                devices.push(initDoorLock());
            } else {
                _logops2.default.debug("Device 'doorLock' is disabled");
            }
            Promise.all(devices) //Wait for devices before registering to server
            .catch(function (errors) {
                _logops2.default.error("Error while initialising devices!", errors);
            }).then(resolve);
        }
    });
}

function initHue() {
    return new Promise(function (resolve) {
        hue = new _Hue2.default(_lwm2mNodeLib2.default.client, _config2.default.sensors.hue.hostname, _config2.default.sensors.hue.username);

        hue.start().catch(function (error) {
            _logops2.default.error("Error while initialising philips-hue!", error);
        }).then(function (lights) {
            _logops2.default.info("Hue: Connected lights", Object.keys(lights));
            resolve();
        });
    });
}

function initTempSensor() {
    return new Promise(function (resolve) {
        tempSensor = new _TempSensor2.default(_lwm2mNodeLib2.default.client, _config2.default.sensors.temperature.refreshInterval);
        tempSensor.start().catch(function (error) {
            _logops2.default.error("Temperature: Error while starting temperature-sensor!", error);
            resolve();
        }).then(function () {
            _logops2.default.info("Temperature: Found temperature sensor/s", tempSensor.sensors);
            resolve();
        });
    });
}

function initDoorLock() {
    return new Promise(function (resolve) {
        doorLock = new _DoorLock2.default(_lwm2mNodeLib2.default.client);
        doorLock.start().catch(function (error) {
            _logops2.default.error("DoorLock: Error while initialising virtual door-lock!", error);
            resolve();
        }).then(function () {
            _logops2.default.info("DoorLock: Virtual door-lock initialised!");
            resolve();
        });
    });
}

function execute(objectType, objectId, resourceId, value, callback) {
    _logops2.default.debug("Received 'execute'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    callback(null);
}

function read(objectType, objectId, resourceId, value, callback) {
    _logops2.default.debug("Received 'read'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    callback(null);
}

function write(objectType, objectId, resourceId, value, callback) {
    _logops2.default.debug("Received 'write'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);

    if (objectType == _lwm2mMapping2.default.getAttrId("light").objectTypeId) {
        if (hue) {
            hue.handleWrite(objectType, objectId, resourceId, value).catch(function (error) {
                _logops2.default.error("Hue: Error while handling lwm2m-write", error);
                callback(error); //TODO: Set error code, not error-msg
            }).then(function () {
                callback(null); //No error
            });
        } else {
            callback(new Error("Hue light not enabled"));
        }
    } else if (objectType == _lwm2mMapping2.default.getAttrId("actuator").objectTypeId) {
        if (!doorLock) {
            callback(new Error("DoorLock not enabled"));
        } else {
            doorLock.handleWrite(objectType, objectId, resourceId, value).catch(function (error) {
                _logops2.default.error("doorLock: Error while handling lwm2m-write", error);
                callback(error);
            }).then(function () {
                callback(null);
            });
        }
    } else {
        callback(new Error("No appropriate device handler found for lwm2m-write"));
    }
}

function setHandlers(deviceInfo) {
    client.setHandler(deviceInfo.serverInfo, 'write', write);
    client.setHandler(deviceInfo.serverInfo, 'execute', execute);
    client.setHandler(deviceInfo.serverInfo, 'read', read);
}

function register() {
    return new Promise(function (resolve, reject) {
        if (globalDeviceInfo) {
            reject(new Error("Can not register, already registered!"));
        } else {
            client.register(_config2.default.connection.host, _config2.default.connection.port, _config2.default.connection.url, _config2.default.connection.endpoint, function (error, deviceInfo) {
                if (error) {
                    reject(error);
                } else {
                    globalDeviceInfo = deviceInfo;
                    setHandlers(deviceInfo);

                    _logops2.default.debug("Registration-info", deviceInfo);
                    resolve();
                }
            });
        }
    });
}

function unregister() {
    return new Promise(function (resolve, reject) {
        if (!globalDeviceInfo) {
            reject(new Error("Can't unregister, not registered!"));
        } else {
            client.unregister(globalDeviceInfo, function (error) {
                if (error) {
                    reject(error);
                } else {
                    globalDeviceInfo = null;
                    resolve();
                }
            });
        }
    });
}

function cmd_showConfig() {
    _logops2.default.info("Loaded configuration", _config2.default);
}

function cmd_stop() {
    _logops2.default.info("Stopping client");
    var timeout_ms = 3000;

    var timeout = setTimeout(function () {
        _logops2.default.info("Timeout: Unable to unregister from server within " + timeout_ms + "ms!");
        stopDevices();
        cmd_exit();
    }, timeout_ms);

    unregister().catch(function (error) {
        _logops2.default.error("Error while unregistering from server!");
        if (error) {
            _logops2.default.error(error);
        }
        clearTimeout(timeout);
        stopDevices();
        cmd_exit();
    }).then(function () {
        clearTimeout(timeout);
        _logops2.default.info("Unregistered from '" + _config2.default.connection.host + ":" + _config2.default.connection.port + "'!");
        _logops2.default.info("Stopping devices");
        stopDevices();

        cmd_exit();
    });
}

function stopDevices() {
    //TODO: Promise (wait for stops)
    if (tempSensor) {
        _logops2.default.info("Stopping temperature-sensor");
        tempSensor.stop();
    }
    if (hue) {
        _logops2.default.info("Stopping hue");
        hue.stop();
    }
    if (doorLock) {
        _logops2.default.info("Stopping doorLock");
        doorLock.stop();
    }
}

function cmd_exit() {
    _logops2.default.info("Stopping cmd...");
    process.exit(0);
}

var commands = {
    'stop': {
        parameters: [],
        description: '\tStop client',
        handler: cmd_stop
    },
    'exit': {
        parameters: [],
        description: '\tExit cmd, forces running threads to stop.',
        handler: cmd_exit
    },
    'config': {
        parameters: [],
        description: '\tShow current configuration',
        handler: cmd_showConfig
    }
};

_commandNode2.default.initialize(commands, '> ');
//# sourceMappingURL=index.js.map