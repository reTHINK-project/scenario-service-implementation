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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_logops2.default.format = _logops2.default.formatters.dev;
_logops2.default.setLevel('INFO'); //Initial log-level, overwritten by config later

var client = _lwm2mNodeLib2.default.client;
var globalDeviceInfo = null;
var tempSensor = null;

_logops2.default.debug("Initialising from config");
init(_config2.default).catch(function (error) {
    _logops2.default.fatal("Error while initialising! Abort.");
    if (error) {
        _logops2.default.fatal(error);
    }
    process.exit(1);
}).then(function () {
    _logops2.default.info("Connecting to server");
    register() //TODO: add timeout
    .catch(function (error) {
        _logops2.default.error("Could not connect to server!", error);
    }).then(function () {
        _logops2.default.info("Registered at server '" + _config2.default.connection.host + ":" + _config2.default.connection.port + "' as '" + _config2.default.connection.endpoint + "'!");
    });
});

function init(config) {
    return new Promise(function (resolve, reject) {
        if (!config || !config.hasOwnProperty("client") || !config.hasOwnProperty("connection")) {
            reject(new Error("Invalid configuration! Can't start."));
        } else {
            _logops2.default.setLevel(config.client.logLevel);
            client.init(config);
            initTempSensor(_lwm2mNodeLib2.default.client, config.sensors.temperature.refreshInterval).then(resolve); //Wait for temperature-sensor before registering to server
        }
    });
}

function initTempSensor(client, refreshInterval) {
    return new Promise(function (resolve) {
        tempSensor = new _TempSensor2.default(client, refreshInterval);
        tempSensor.start().catch(function (error) {
            _logops2.default.error("Error while starting temperature-sensor!", error);
            resolve();
        }).then(function () {
            _logops2.default.info("Reading temperature sensor/s", tempSensor.sensors);
            resolve();
        });
    });
}

function execute(objectType, objectId, resourceId, value, callback) {
    _logops2.default.debug("Received 'execute'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    _commandNode2.default.prompt();
    callback(null);
}

function read(objectType, objectId, resourceId, value, callback) {
    _logops2.default.debug("Received 'read'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    _commandNode2.default.prompt();
    callback(null);
}

function write(objectType, objectId, resourceId, value, callback) {
    _logops2.default.debug("Received 'write'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    _commandNode2.default.prompt();
    callback(null);
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
    _logops2.default.info(_config2.default);
}

function cmd_stop() {
    _logops2.default.info("Stopping client");

    if (tempSensor) {
        tempSensor.stop();
    }

    unregister().catch(function (error) {
        _logops2.default.error("Error while unregistering from server!");
        if (error) {
            _logops2.default.error(error);
        }
        cmd_exit();
    }).then(function () {
        _logops2.default.info("Unregistered from '" + _config2.default.connection.host + ":" + _config2.default.connection.port + "'!");
        cmd_exit();
    });
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