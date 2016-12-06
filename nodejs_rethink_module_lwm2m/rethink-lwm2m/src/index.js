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
import HTTPInterface from "./HTTPInterface";
import mapping from "./lwm2m-mapping";

let lwm2m = {};
lwm2m.server = lwm2mlib.server; //Enables use of all native lwm2m-lib methods
lwm2m.serverInfo = {};
let config = {};
let database;
let httpInterface;

logger.format = logger.formatters.dev;

lwm2m.setConfig = (c) => {
    config = c;

    if (config.server.logLevel) {
        logger.setLevel(config.server.logLevel);
    }
};

lwm2m.getConfig = () => {
    return config;
};

lwm2m.start = () => {
    return new Promise((resolve, reject) => {
        if (typeof config === 'undefined') {
            logger.error("Missing configuration!");
            reject();
        }
        initdb()
            .catch(reject)
            .then(() => {
                return startm2m();
            })
            .catch(reject)
            .then(() => {
                return initHTTP();
            })
            .catch(reject)
            .then(resolve);
    });

};

function initdb() {
    return new Promise((resolve, reject) => {
        database = new Database(config);
        database.connect()
            .catch((error) => {
                logger.error(error);
                reject(error);
            })
            .then(() => {
                return database.isInitialised()
            })
            .catch((error) => {
                logger.error(error);
                reject(error);
            })
            .then((initialised) => {
                if (!initialised) {
                    database.createHotel()
                        .catch((error) => {
                            logger.error(error);
                            reject(error);
                        })
                        .then((errors) => {
                            if (errors) {
                                logger.error("Problems while initialising db: ", errors);
                            }
                            else {
                                logger.info("Database initialised with config-data!");
                            }
                            resolve();
                        });
                }
                else {
                    logger.info("Database already initialised. Using existing data.");
                    resolve();
                }
            });
    });
}

function startm2m() {
    return new Promise((resolve, reject) => {
        lwm2m.server.start(config.server, (error, results) => {
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


lwm2m.stop = () => {
    return new Promise((resolve, reject) => {
        if (!lwm2m.serverInfo) { //If server not running, abort.
            reject(error);
        }
        httpInterface.close()
            .catch((error) => {
                logger.error("Error while closing httpInterface!", error);
            })
            .then(() => {
                logger.debug("Closed http-interface");
            });
        database.disconnect()
            .catch((error) => {
                logger.error("Error while disconnecting from db!", error);
            })
            .then(() => {
                logger.debug("Disconnected from db");
            });
        lwm2m.server.stop(lwm2m.serverInfo, (error) => { //TODO: Observes somehow do not stop on lwm2m.server stop
            if (error) {
                reject(error);
            }
            else {
                logger.debug("Stopped lwm2m");
                resolve();
            }
        });
    });
};

function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    logger.info('\nDevice registration:\n----------------------------\n');
    logger.info('Endpoint name: %s\nLifetime: %s\nBinding: %s\n Payload: %s', endpoint, lifetime, binding, payload);

    database.registerDevice(endpoint, true, payload)
        .catch((error) => {
            logger.error("Error while updating device-data", error);
        })
        .then(() => {
            //TODO: Make list of objects/resources to observe configurable

            //TEMPERATURE
            let tempObj = mapping.getAttrId("temperature").objectTypeId;
            logger.debug("Got object for observe job:", tempObj);
            observeDeviceData(endpoint, tempObj, 0, mapping.getAttrId("temperature", "value").resourceTypeId);
            observeDeviceData(endpoint, tempObj, 0, mapping.getAttrId("temperature", "unit").resourceTypeId);

            //Old
            //observeDeviceData(endpoint, 3303, 0, 5700); //Temperature
            //observeDeviceData(endpoint, 3303, 0, 5701); //Unit

            //HUMIDITY
            let humObj = mapping.getAttrId("humidity").objectTypeId;
            logger.debug("Got object for observe job:", humObj);
            observeDeviceData(endpoint, humObj, 0, mapping.getAttrId("humidity", "value").resourceTypeId);
            observeDeviceData(endpoint, humObj, 0, mapping.getAttrId("humidity", "unit").resourceTypeId);

            //Old
            //observeDeviceData(endpoint, 3304, 0, 5700); //Humidity
            //observeDeviceData(endpoint, 3304, 0, 5701); //Unit

            //LIGHT
            //Get list of light-ids
            var lightIdsMatch = new RegExp("<\/3311[\/]([0-9]+)>", "g");
            var lightIds = [];
            var result = null;
            do {
                result = lightIdsMatch.exec(payload);
                if (result != null) {
                    lightIds.push(result[1]);
                }
            }
            while (result != null);
            let lightObj = mapping.getAttrId("light").objectTypeId;
            logger.debug("Got object for observe job:", lightObj);
            lightIds.forEach((id) => {
                observeDeviceData(endpoint, lightObj, id, mapping.getAttrId("light", "name").resourceTypeId);
                observeDeviceData(endpoint, lightObj, id, mapping.getAttrId("light", "isOn").resourceTypeId);
                observeDeviceData(endpoint, lightObj, id, mapping.getAttrId("light", "dimmer").resourceTypeId);
                observeDeviceData(endpoint, lightObj, id, mapping.getAttrId("light", "color.value").resourceTypeId);
                observeDeviceData(endpoint, lightObj, id, mapping.getAttrId("light", "color.unit").resourceTypeId);

                //observeDeviceData(endpoint, 3311, id, 5801); //Light name
                //observeDeviceData(endpoint, 3311, id, 5850); //Light on/off state
                //observeDeviceData(endpoint, 3311, id, 5851); //Light dimmer
                //observeDeviceData(endpoint, 3311, id, 5706); //Light color
                //observeDeviceData(endpoint, 3311, id, 5701); //Light color unit
            });

            //LOCK or misc actuators
            let actObj = mapping.getAttrId("actuator").objectTypeId;
            observeDeviceData(endpoint, actObj, 0, mapping.getAttrId("actuator", "isOn").resourceTypeId);
            observeDeviceData(endpoint, actObj, 0, mapping.getAttrId("actuator", "name").resourceTypeId);
            observeDeviceData(endpoint, actObj, 0, mapping.getAttrId("actuator", "applicationType").resourceTypeId);

            callback();
        });
}

function unregistrationHandler(device, callback) {
    logger.info('\nDevice unregistration:\n----------------------------\n');
    logger.info('Device location: %s', device.name);

    database.registerDevice(device.name, false)
        .catch((error) => {
            logger.error("Error while updating device-data", error);
        })
        .then(callback);
}


function observeHandler(value, objectType, objectId, resourceId, deviceId) {
    lwm2m.server.getRegistry().get(deviceId, (error, device) => {
        if (error) {
            logger.error("Error while getting device by id", error);
        }
        else {
            database.storeValue(device.name, objectType, objectId, resourceId, value)
                .catch((error) => {
                    logger.error("Error while storing observe-data in db! Device: %s", device.name, error);
                })
                .then(() => {
                    logger.debug("Stored observe-data for device '%s' in db!", device.name);
                });
        }
    });
    logger.debug("Observe-handler device [deviceId " + deviceId + ", objectType " + objectType + ", objectId " + objectId + ", resourceId: " + resourceId + "] => " + value);
}

function observeDeviceData(deviceName, objectType, objectId, resourceId) {
    logger.debug("observeDeviceData(): start")
    logger.debug("test");
    lwm2m.server.getRegistry().getByName(deviceName, (error, device) => {
        if (error) {
            logger.error(error);
        }
        else {
            lwm2m.server.observe(device.id, objectType, objectId, resourceId, observeHandler, (error, value) => {
                if (error) {
                    logger.error("Error while starting observe!", error)
                }
                else {
                    logger.debug("Started observe for '%s'. First value: ", deviceName, value);
                    if (value === '') { //No data => Device does not set data
                        logger.debug("Device '" + deviceName + "' does not set /" + objectType + "/" + objectId + "/" + resourceId + "! Canceling observe.");
                        lwm2m.server.cancelObserver(device.id, objectType, objectId, resourceId, () => {
                            logger.debug("Observe for '%s' canceled!", device.name);
                        });
                    }
                    else {
                        logger.debug("START: database.storeValue(" + deviceName + ", " + objectType + ", " + objectId + ", " + resourceId + ", " + value + ")");
                        database.storeValue(deviceName, objectType, objectId, resourceId, value)
                            .catch((error) => {
                                logger.error("Error while storing initial read-data!", error);
                            })
                            .then(() => {
                                logger.debug("DONE: database.storeValue(" + deviceName + ", " + objectType + ", " + objectId + ", " + resourceId + ", " + value + ")");
                            });
                    }
                }
            });
        }
    });

}

function setHandlers() {
    return new Promise((resolve) => {
        lwm2m.server.setHandler(lwm2m.serverInfo, 'registration', registrationHandler);
        lwm2m.server.setHandler(lwm2m.serverInfo, 'unregistration', unregistrationHandler);
        logger.debug("Set registration handlers.");
        resolve();
    });
}

function initHTTP() {
    return new Promise((resolve, reject) => {
        if (!config.http.enabled) {
            logger.debug("httpInterface not enabled");
            resolve();
        }
        else {
            logger.debug("Starting HTTP-interface");
            httpInterface = new HTTPInterface(config.http.host, config.http.port, config.http.key, config.http.cert, database, lwm2m);
            httpInterface.open()
                .catch(error => {
                    logger.error("Error while starting HTTP-interface", error);
                    reject(error);
                })
                .then(() => {
                    logger.info("Started HTTP-interface");
                    resolve();
                });
        }
    });
}

export default lwm2m;