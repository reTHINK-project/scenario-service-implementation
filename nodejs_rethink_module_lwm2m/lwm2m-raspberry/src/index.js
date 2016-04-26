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


import lwm2mlib from "lwm2m-node-lib";
import logger from "logops";
import cmd from "command-node";
import config from "./../config";
import TempSensor from "./TempSensor";
import Hue from "./Hue";

logger.format = logger.formatters.dev;
logger.setLevel('INFO'); //Initial log-level, overwritten by config later


var client = lwm2mlib.client;
var globalDeviceInfo = null;
var tempSensor = null;
var hue = null;

logger.debug("Initialising from config");
init()
    .catch(function (error) {
        logger.fatal("Error while initialising! Abort.");
        if (error) {
            logger.fatal(error);
        }
        process.exit(1);
    })
    .then(function () {
        logger.info("Connecting to lwm2m-server [" + config.connection.host + ":" + config.connection.port + "] as '" + config.connection.endpoint + "'");
        register() //TODO: add timeout
            .catch(function (error) {
                logger.error("Could not connect to server!", error);
            })
            .then(function () {
                logger.info("Registered at server '" + config.connection.host + ":" + config.connection.port + "' as '"
                    + config.connection.endpoint + "'!");
            });
    });

function init() {
    return new Promise(function (resolve, reject) {
        if (!config || !config.hasOwnProperty("client") || !config.hasOwnProperty("connection")) {
            reject(new Error("Invalid configuration! Can't start."));
        }
        else {
            logger.setLevel(config.client.logLevel);

            logger.info("Initialising client");
            //Init lwm2m-client
            client.init(config);

            logger.info("Starting devices");
            //Init devices attached and enabled
            var devices = [];
            if (config.sensors.hasOwnProperty("temperature") && config.sensors.temperature.enabled === true) {
                devices.push(initTempSensor());
            }
            else {
                logger.debug("Device 'temperature' is disabled");
            }
            if (config.sensors.hasOwnProperty("hue") && config.sensors.hue.enabled === true) {
                devices.push(initHue());
            }
            else {
                logger.debug("Device 'hue' is disabled");
            }
            Promise.all(devices) //Wait for devices before registering to server
                .catch((errors) => {
                    logger.error("Error while initialising devices!", errors);
                })
                .then(resolve);
        }
    });
}

function initHue() {
    return new Promise((resolve) => {
        hue = new Hue(lwm2mlib.client, config.sensors.hue.hostname, config.sensors.hue.username);

        hue.start()
            .catch((error) => {
                logger.error("Error while initialising philips-hue!", error);
            })
            .then((lights) => {
                logger.info("Hue: Connected lights", Object.keys(lights));
                resolve();
            });
    })
}

function initTempSensor() {
    return new Promise((resolve) => {
        tempSensor = new TempSensor(lwm2mlib.client, config.sensors.temperature.refreshInterval);
        tempSensor.start()
            .catch((error) => {
                logger.error("Temperature: Error while starting temperature-sensor!", error);
                resolve();
            })
            .then(() => {
                logger.info("Temperature: Found temperature sensor/s", tempSensor.sensors);
                resolve();
            });
    });
}


function execute(objectType, objectId, resourceId, value, callback) {
    logger.debug("Received 'execute'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    callback(null);
}

function read(objectType, objectId, resourceId, value, callback) {
    logger.debug("Received 'read'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);
    callback(null);
}

function write(objectType, objectId, resourceId, value, callback) {
    logger.debug("Received 'write'\n" + objectType + "/" + objectId + " " + resourceId + " " + value);

    if (config.sensors.hue.enabled === true && hue !== null) {
        if (objectType == "3311") {
            hue.handleWrite(objectType, objectId, resourceId, value)
                .catch((error) => {
                    logger.error("Hue: Error while handling lwm2m-write", error);
                })
                .then(() => {
                    callback(null);
                });
        }
    }
    else {
        callback(null);
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
        }
        else {
            client.register(config.connection.host, config.connection.port, config.connection.url,
                config.connection.endpoint, function (error, deviceInfo) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        globalDeviceInfo = deviceInfo;
                        setHandlers(deviceInfo);

                        logger.debug("Registration-info", deviceInfo);
                        resolve();
                    }
                })
        }
    });
}

function unregister() {
    return new Promise(function (resolve, reject) {
        if (!globalDeviceInfo) {
            reject(new Error("Can't unregister, not registered!"));
        }
        else {
            client.unregister(globalDeviceInfo, function (error) {
                if (error) {
                    reject(error);
                }
                else {
                    globalDeviceInfo = null;
                    resolve();
                }
            })
        }
    });
}

function cmd_showConfig() {
    logger.info(config);
}

function cmd_stop() {//TODO: Make sure lwm2m is unregistered before stopping devices
    logger.info("Stopping client");

    unregister()
        .catch(function (error) {
            logger.error("Error while unregistering from server!");
            if (error) {
                logger.error(error);
            }
            cmd_exit();
        })
        .then(function () {
            logger.info("Unregistered from '" + config.connection.host + ":" + config.connection.port + "'!");
            cmd_exit();
        });

    logger.info("Stopping devices");
    if (tempSensor) {
        logger.info("Stopping temperature-sensor");
        tempSensor.stop();
    }
    if (hue) {
        logger.info("Stopping hue");
        hue.stop();
    }
}

function cmd_exit() {
    logger.info("Stopping cmd...");
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

cmd.initialize(commands, '> ');
