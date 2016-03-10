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

//TODO: Promises
lwm2m.start = function (callback) {
    if (typeof config === 'undefined') {
        logger.error("Missing configuration!");
    }

    database = new Database(config.db.host, config.db.database);

    database.connect(function (error) {
        if (error) {
            return callback(error);
        }
        database.isInitialised(function (initialised, err) {
            if (err) {
                logger.error(err);
            }
            else {
                if (!initialised) {
                    database.createHotel(config.hotel, function (error) {
                        if (error) {
                            logger.error(error);
                            return callback(error);
                        }

                        logger.info("Database initialised with config-data! Ready to start.");
                    });
                }
                else {
                    logger.info("Database already initialised. Using existing data.");
                }
            }

            lwm2m.server.start(config.server, function (error, results) {
                if (error) {
                    return callback(error);
                }
                lwm2m.serverInfo = results;
                setHandlers(function () {
                    logger.info("Initialised registration handlers");
                    callback();
                });

            });

        });
    });
};


lwm2m.stop = function (callback) {
    database.disconnect(function (error) {
        if (error) {
            logger.error(error);
        }
    });

    if (!lwm2m.serverInfo) {
        var error = "Can't stop server. Not running";
        logger.error(error);
        return callback(error);
    }

    lwm2m.server.stop(lwm2m.serverInfo, function (error) {
        callback(error);
    });
};


//TODO: Update references
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

//TODO: Update references
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

function setHandlers(callback) {
    lwm2m.server.setHandler(lwm2m.serverInfo, 'registration', registrationHandler);
    lwm2m.server.setHandler(lwm2m.serverInfo, 'unregistration', unregistrationHandler);
    callback();
}

export default lwm2m;