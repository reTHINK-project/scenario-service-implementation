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

import mongoose from "mongoose";
import Room from "./models/Room";
import Device from "./models/Device";
import async from "async";
import logger from "logops";


class Database {

    constructor(config) {
        this._config = config;
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
                        device.registration.payload = null;
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

    storeValue(deviceName, uri, value) {
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
                        var data = {};
                        var pushNew = true;

                        data.timestamp = Date.now();
                        data.uri = uri;
                        data.value = value;

                        if (device.lastValues.length > 0) {
                            device.lastValues.forEach((currValue) => {
                                if (currValue.uri == uri) {
                                    currValue.value = data.value;
                                    currValue.timestamp = data.timestamp;
                                    pushNew = false;
                                    //TODO: Exit loop, we're done
                                }
                            });
                        }
                        if (pushNew) {
                            device.lastValues.push(data);
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

    getRoom(roomName) {
        var that = this;
        return new Promise((resolve, reject) => {
            if (typeof roomName === "undefined") {
                reject(new Error("Invalid room-name!"));
            }
            else {
                if (!that.connected()) {
                    reject(new Error("Not connected to db!"));
                }
            }
            Room.model.findOne({name: roomName})
                .populate('devices')
                .exec((error, room) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(room);
                });
        });
    }
}

export default Database;