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
import logger from "logops";
import lwm2mlib from "lwm2m-node-lib";
import Database from "./Database";

let lwm2m = {};
lwm2m.server = lwm2mlib.server; //Enables use of all native lwm2m-lib methods
lwm2m.serverInfo = {};
let config = {};
let database;

lwm2m.setConfig = function (c) {
    config = c;

    if (config.server.logLevel) {
        logger.setLevel(config.server.logLevel);
    }
};

lwm2m.getConfig = function () {
    return config;
};

lwm2m.start = function () {
    return new Promise(function (resolve, reject) {
        if (typeof config === 'undefined') {
            logger.error("Missing configuration!");
            reject();
        }
        database = new Database(config);
        database.connect()
            .catch(function (error) {
                logger.error(error);
                reject(error);
            })
            .then(function () {
                database.isInitialised()
                    .catch(function (error) {
                        logger.error(error);
                        reject(error);
                    })
                    .then(function (initialised) {
                        if (!initialised) {
                            database.createHotel()
                                .catch(function (error) {
                                    logger.error(error);
                                    reject(error);
                                })
                                .then(function (errors) {
                                    if (errors) {
                                        logger.error("Problems while initialising db: ", errors);
                                    }
                                    else {
                                        logger.info("Database initialised with config-data!");
                                    }
                                    startm2m()
                                        .catch(reject)
                                        .then(resolve);
                                });
                        }
                        else {
                            logger.info("Database already initialised. Using existing data.");
                            startm2m()
                                .catch(reject)
                                .then(resolve);
                        }
                    });
            });
    });
};

function startm2m() {
    return new Promise(function (resolve, reject) {
        lwm2m.server.start(config.server, function (error, results) {
            if (error) {
                logger.error(error);
                reject(error);
            }
            else {
                lwm2m.serverInfo = results;
                setHandlers().then(resolve);
            }
        });
    });
}


lwm2m.stop = function () {
    return new Promise(function (resolve, reject) {
        database.disconnect()
            .catch(function (error) {
                logger.error(error);
                reject();
            });

        if (!lwm2m.serverInfo) {
            var error = "Can't stop m2m server. Not running";
            logger.error(error);
            reject(error);
        }

        lwm2m.server.stop(lwm2m.serverInfo, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};

function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    logger.info('\nDevice registration:\n----------------------------\n');
    logger.info('Endpoint name: %s\nLifetime: %s\nBinding: %s\n Payload: %s', endpoint, lifetime, binding, payload);

    database.registerDevice(endpoint, true, payload)
        .catch(function (error) {
            logger.error("Error while updating device-data", error);
        })
        .then(function () {
            observeDeviceData(endpoint, 3303, 0, 5700); //Temperature
            observeDeviceData(endpoint, 3304, 0, 5700); //Humidity
            callback();
        });
}

function unregistrationHandler(device, callback) {
    logger.info('\nDevice unregistration:\n----------------------------\n');
    logger.info('Device location: %s', device.name);

    database.registerDevice(device.name, false)
        .catch(function (error) {
            logger.error("Error while updating device-data", error);
        })
        .then(callback);
}


function observeHandler(objectType, objectId, resourceId, deviceId, value) {
    lwm2m.server.getRegistry().get(deviceId, function (error, device) {
        database.storeValue(device.name, ('/' + objectType + '/' + objectId + '/' + resourceId), value)
            .catch(function (error) {
                logger.error("Error while storing observe-data in db! Device: %s", device.name, error);
            })
            .then(function () {
                logger.debug("Stored observe-data for device '%s' in db!", device.name);
            });
    });
    logger.debug("Observe-handler device [" + deviceId + ", objectType " + objectType + ", objectId " + objectId + ", resourceId: " + resourceId + "] => " + value);
}

function observeDeviceData(deviceName, objectType, objectId, resourceId) {
    lwm2m.server.getRegistry().getByName(deviceName, function (error, device) {
        if (error) {
            logger.error(error);
        }
        else {
            lwm2m.server.observe(device.id, objectType, objectId, resourceId, observeHandler, function (error, value) {
                if (error) {
                    logger.error("Error while starting observe!", error)
                }
                else {
                    logger.debug("Started observe for %s. First value: ", deviceName, value);
                    database.storeValue(deviceName, ('/' + objectType + '/' + objectId + '/' + resourceId), value)
                        .catch(function (error) {
                            logger.error("Error while storing initial read-data!", error);
                        })
                        .then(function () {
                            logger.debug("Stored initial read-data from observe.");
                        });
                }
            });
        }
    });

}

function setHandlers() {
    return new Promise(function (resolve) {
        lwm2m.server.setHandler(lwm2m.serverInfo, 'registration', registrationHandler);
        lwm2m.server.setHandler(lwm2m.serverInfo, 'unregistration', unregistrationHandler);
        logger.debug("Set registration handlers.");
        resolve();
    });
}

export default lwm2m;