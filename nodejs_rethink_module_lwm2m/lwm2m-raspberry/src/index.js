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

logger.format = logger.formatters.dev;
logger.setLevel('INFO'); //Initial log-level, overwritten by config later


var client = lwm2mlib.client;
var globalDeviceInfo = null;
var tempSensor = null;

logger.debug("Initialising from config");
init(config)
    .catch(function (error) {
        logger.fatal("Error while initialising! Abort.");
        if (error) {
            logger.fatal(error);
        }
        process.exit(1);
    })
    .then(function () {
        logger.info("Connecting to server");
        register() //TODO: add timeout
            .catch(function (error) {
                logger.error("Could not connect to server!", error);
            })
            .then(function () {
                logger.info("Registered at server '" + config.connection.host + ":" + config.connection.port + "' as '" + config.connection.endpoint + "'!");
            });
    });

function init(config) {
    return new Promise(function (resolve, reject) {
        if (!config || !config.hasOwnProperty("client") || !config.hasOwnProperty("connection")) {
            reject(new Error("Invalid configuration! Can't start."));
        }
        else {
            logger.setLevel(config.client.logLevel);
            client.init(config);
            initTempSensor(lwm2mlib.client, config.sensors.temperature.refreshInterval);

            resolve();
        }
    });
}

function initTempSensor(client, refreshInterval) {
    tempSensor = new TempSensor(client, refreshInterval);
    tempSensor.start()
        .catch((error) => {
            logger.error("Error while starting temperature-sensor!", error);
        })
        .then(() => {
            logger.info("Reading temperature sensor/s", tempSensor.sensors);
        });
}


function register() {
    return new Promise(function (resolve, reject) {
        if (globalDeviceInfo) {
            reject(new Error("Can not register, already registered!"));
        }
        else {
            client.register(config.connection.host, config.connection.port, config.connection.url, config.connection.endpoint, function (error, deviceInfo) {
                if (error) {
                    reject(error);
                }
                else {
                    globalDeviceInfo = deviceInfo;
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

function cmd_stop() {
    logger.info("Stopping client");

    if (tempSensor) {
        tempSensor.stop();
    }

    unregister()
        .catch(function (error) {
            logger.error("Error while unregistering from server!");
            if (error) {
                logger.error(error);
            }
        })
        .then(function () { //TODO: Fix: Also runs on .catch above
            logger.info("Unregistered from '" + config.connection.host + ":" + config.connection.port + "'!");
        })
        .then(function () { //Always
            process.exit(0);
        });
}

var commands = {
    'stop': {
        parameters: [],
        description: '\tStop client',
        handler: cmd_stop
    },
    'config': {
        parameters: [],
        description: '\tShow current configuration',
        handler: cmd_showConfig
    }
};

cmd.initialize(commands, '> ');
