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
import mongoose from "mongoose";
import Room from "./models/Room";
import Device from "./models/Device";
import async from "async";
import logger from "logops";
import util from "./Util";
import mapping from "./lwm2m-mapping";

class Database {

    constructor(config) {
        this._config = config;
        this._lastStoreValue = null;
    }

    set config(config) {
        this._config = config;
    }

    get config() {
        return this._config;
    }

    get connection() {
        return this._connection;
    }

    connect() {
        var that = this;
        return new Promise((resolve, reject) => {
            if (that.connected()) {
                reject(new Error("Already connected or connection pending!"));
            }
            else {
                that._init().then(resolve);
            }
        });
    }

    _init() {
        var that = this;
        return new Promise((resolve) => {
            that._connection = mongoose.createConnection(that.config.db.host, that.config.db.database);
            that.connection.on('error', function mongodbErrorHandler(error) {
                logger.fatal('Could not establish connection to mongodb!', error);
                throw new Error(error);
            });
            that.connection.once('open', () => {
                logger.debug('Database.js: connected to mongodb!');
                Device.load(that.connection);
                Room.load(that.connection);
                resolve();
            });
        });
    }

    disconnect() {
        var that = this;
        return new Promise((resolve, reject) => {
            if (that.connected()) {
                that.connection.close(() => {
                    resolve();
                })
            }
            else {
                reject(new Error("Can't close db-connection: Not connected!"));
            }
        });
    }

    connected() {
        if (typeof this.connection !== 'undefined') {
            return this.connection.readyState === 1 || this.connection.readyState === 2;
        }
        else {
            return false;
        }
    }

    isInitialised() {
        var that = this;
        return new Promise((resolve, reject) => {
            if (!that.connected()) {
                reject(new Error("Not connected to db!"));
            }
            else {
                that.connection.db.listCollections({name: 'rooms'}) //appended 's' is mongoose-behavior, see: http://bit.ly/1Lq65AJ)
                    .next((err, collinfo) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(typeof collinfo !== 'undefined' && collinfo !== null);
                        }
                    });
            }
        });
    }


    createHotel() {
        var that = this;
        return new Promise((resolve, reject) => {
            if (typeof that.config === 'undefined') {
                reject(new Error("Missing config!"));
            }
            else {
                if (!that.connected()) {
                    reject(new Error("Can't save data to db! Not connected!"));
                }
                else {
                    var errors = [];

                    that._parseRooms(errors)
                        .then((errors) => {
                            return that._parseDevices(errors);
                        })
                        .then((errors) => {
                            return that._setReferences(errors);
                        })
                        .then((errors) => {
                            if (errors.length === 0) {
                                errors = null;
                            }
                            resolve(errors);
                        });
                }
            }
        });
    }

    _parseRooms(errors) {
        var that = this;
        return new Promise((resolve) => {
            if (!that.config.hotel.hasOwnProperty('rooms')) {
                resolve(errors);
            }
            else {
                logger.debug("Room-cfg existing, adding to db.");

                async.each(that.config.hotel.rooms, (cfg_room, callback2) => {
                        var room = Room.model();
                        room.name = cfg_room.name;
                        room.isBooked = cfg_room.isBooked;
                        room.wifi = cfg_room.wifi;
                        room.members = cfg_room.members;
                        room.save((error) => {
                            if (error) {
                                errors.push(error);
                            }
                            logger.debug("Added room '%s'", cfg_room.name);
                            callback2();
                        });

                    },
                    () => {
                        resolve(errors);
                    }
                );
            }
        });
    }

    _parseDevices(errors) {
        var that = this;
        return new Promise((resolve) => {
            if (!that.config.hotel.hasOwnProperty('devices')) {
                resolve(errors);
            }
            else {
                logger.debug("Device-cfg existing, adding to db.");

                async.each(that.config.hotel.devices, (cfg_device, callback2) => {
                    var device = Device.model();
                    device.name = cfg_device.name;
                    device.save((error) => {
                        if (error) {
                            errors.push(error);
                        }
                        logger.debug("Added device '%s'", cfg_device.name);
                        callback2();
                    });
                }, () => {
                    resolve(errors);
                });
            }
        });

    }

    _setReferences(errors) {
        var that = this;
        return new Promise((resolve) => {
            logger.debug("Establishing db-references");
            async.each(that.config.hotel.devices, (cfg_device, callback) => {
                if (!cfg_device.hasOwnProperty('room')) {
                    logger.debug("Device '%s' has no room-reference. Skipping...", cfg_device.name);
                    return callback();
                }
                Room.model.findOne({name: cfg_device.room}, (error, room) => {
                    if (error) {
                        errors.push(new Error("Error while querying db", error));
                        return callback();
                    }
                    else {
                        if (!room) {
                            errors.push(new Error("Invalid reference '" + cfg_device.name + "." + cfg_device.room + "'! Room '" + cfg_device.room + "' not found."));
                            return callback();
                        }
                    }
                    Device.model.findOne({name: cfg_device.name}, (error, device) => {
                        if (error) {
                            errors.push(new Error("Error while querying db", error));
                            return callback();
                        }
                        if (!device) {
                            errors.push(new Error("Can't set reference, device '" + cfg_device.name + "' not found in db"));
                            return callback();
                        }
                        //Bidirectional
                        device.room = room;
                        room.devices.push(device);

                        device.save((error) => {
                            if (error) {
                                errors.push(error);
                                return callback();
                            }
                            room.save((error) => {
                                if (error) {
                                    errors.push(error);
                                    return callback();
                                }
                                logger.debug("Linked device '%s' to room '%s'", device.name, room.name);
                                callback();
                            })
                        });
                    });
                });
            }, () => {
                resolve(errors);
            });
        });
    }


    /*
     register type:Boolean - Register or de-register device
     */
    registerDevice(deviceName, register, payload) {
        return new Promise((resolve, reject) => {
            if (typeof register !== 'boolean') {
                reject(new Error("Invalid param. register, boolean expected."));
            }
            Device.model.findOne({name: deviceName}, (error, device) => { //Get device by name
                if (error) {
                    reject(error);
                }
                else {
                    if (!device) {
                        logger.debug("Device not existing in db, creating ...");

                        device = Device.model();
                        device.name = deviceName;
                    }

                    device.registration.registered = register;
                    if (register) device.registration.timestamp = Date.now();

                    //Set / remove payload if given
                    if (register === true) {
                        if (typeof payload !== 'undefined' && payload !== null)
                            device.registration.payload = payload;
                    }
                    else {
                        device.registration.payload = undefined;
                    }

                    device.save((error) => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                }
            });
        });
    }

    //Wait for other queries to finish
    storeValue(deviceName, objectType, objectId, resourceId, value) {
        var that = this;
        if (that._lastStoreValue === null) {
            that._lastStoreValue = that._storeValueSynced(deviceName, objectType, objectId, resourceId, value);
            return that._lastStoreValue;
        }
        else {
            that._lastStoreValue = new Promise((resolve, reject) => {
                that._lastStoreValue
                    .catch(reject)
                    .then(() => {
                        that._storeValueSynced(deviceName, objectType, objectId, resourceId, value)
                            .catch(reject)
                            .then(() => {
                                resolve();
                            });
                    });
            });
            return that._lastStoreValue;
        }
    }

    _storeValueSynced(deviceName, objectType, objectId, resourceId, value) {
        return new Promise((resolve, reject) => {
            Device.model.findOne({name: deviceName}, (error, device) => {
                if (error) {
                    reject(error);
                }
                else {
                    if (!device) {
                        reject(new Error("Can't store value in db for device '" + deviceName + "'! Device not found!"));
                    }
                    else {
                        var category;
                        var location;

                        var attr = mapping.getAttrName(objectType, resourceId);
                        if (attr === null) {
                            category = "misc";
                            location = "value";
                        }
                        else {
                            category = attr.objectType;
                            location = attr.resourceType;

                            //Parse floats if needed
                            if (((category === "temperature" || category === "humidity" ) && location === "value")
                                || category === "light" && location === "dimmer"
                            ) {
                                value = parseFloat(value);
                            }
                            else {
                                //Parse color array (hue specific)
                                if (category === "light" && location === "color.value") {
                                    try {
                                        value = JSON.parse(value);
                                    }
                                    catch (error) {
                                        logger.error("Error while parsing color.value", error);
                                    }
                                }
                            }
                        }


                        var found = false;
                        device.lastValues[category].forEach((entry) => {
                            if (entry.id === parseInt(objectId)) {
                                util.setNestedValue(entry, location, value);
                                if (location === "misc") {
                                    entry.uri = '/' + objectType + '/' + objectId + '/' + resourceId;
                                }
                                entry.timestamp = Date.now();
                                found = true;
                            }
                        });

                        if (!found) {
                            var obj = {};
                            util.setNestedValue(obj, location, value);
                            if (location === "misc") {
                                obj.uri = '/' + objectType + '/' + objectId + '/' + resourceId;
                            }
                            obj.id = objectId;
                            obj.timestamp = Date.now();
                            device.lastValues[category].push(obj);
                        }

                        device.save((error) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                }
            });
        });
    }

    getObject(type, objName) {
        return new Promise((resolve, reject) => {
            if (typeof type === "undefined") {
                reject(new Error("Database.getObject(): Invalid parameters!"));
            }
            else {
                var model = {};
                switch (type) {
                    case "device":
                        model = Device.model;
                        break;
                    case "room":
                        model = Room.model;
                        break;
                    default:
                        reject(new Error("Invalid type"));
                        break;
                }
                var query;
                if (typeof objName === "undefined" || objName === null) {
                    query = model.find();
                }
                else {
                    query = model.findOne({name: objName});
                }
                if (type === "room") { //Check if we need to populate
                    query.populate("devices");
                }
                query.exec((error, result) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(result);
                });
            }
        });
    }
}

export default Database;