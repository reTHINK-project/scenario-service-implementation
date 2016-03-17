import logger from 'logops';
import lwm2mlib from 'lwm2m-node-lib';
import Database from './Database';
import Hotel from './models/Hotel';
import Device from './models/Device';

'use strict';

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
    logger.info('Endpoint name: %s\nLifetime: %s\nBinding: %s', endpoint, lifetime, binding);

    database.registerDevice(endpoint, true, function (error) {
        if (error) {
            logger.error("Error while updating device-data")
        }
        logger.debug("Device info for '%s' stored in db.", endpoint);

        callback();
    });
}

function unregistrationHandler(device, callback) {
    logger.info('\nDevice unregistration:\n----------------------------\n');
    logger.info('Device location: %s', device.name);

    database.registerDevice(device.name, false, function (error) {
        if (error) {
            logger.error("Error while updating device-data", error)
        }
        logger.debug("Device info for '%s' stored in db.", device.name);

        callback();
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