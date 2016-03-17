/**
 * Created by pzu on 11.02.16.
 */
import mongoose from 'mongoose';

import Hotel from './models/Hotel';
import Room from './models/Room';
import Device from './models/Device';
import async from 'async';
import logger from 'logops';


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
        return new Promise(function (resolve, reject) {
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
        return new Promise(function (resolve) {
            that._connection = mongoose.createConnection(that.config.db.host, that.config.db.database);
            that.connection.on('error', function mongodbErrorHandler(error) {
                logger.fatal('Could not establish connection to mongodb!', error);
                throw new Error(error);
            });
            that.connection.once('open', function () {
                logger.debug('Database.js: connected to mongodb!');
                Device.load(that.connection);
                Hotel.load(that.connection);
                Room.load(that.connection);
                resolve();
            });
        });
    }

    disconnect() {
        var that = this;
        return new Promise(function (resolve, reject) {
            if (that.connected()) {
                that.connection.close(function () {
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
        return new Promise(function (resolve, reject) {
            if (!that.connected()) {
                reject(new Error("Not connected to db!"));
            }
            else {
                that.connection.db.listCollections({name: 'hotels'}) //appended 's' is mongoose-behavior, see: http://bit.ly/1Lq65AJ)
                    .next(function (err, collinfo) {
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
        return new Promise(function (resolve, reject) {
            if (typeof that.config === 'undefined') {
                reject(new Error("Missing config!"));
            }
            else {
                if (!that.connected()) {
                    reject(new Error("Can't save data to db! Not connected!"));
                }
                else {
                    var errors = [];

                    that._parseHotel(errors)
                        .then(function (errors) {
                            return that._parseRooms(errors);
                        })
                        .then(function (errors) {
                            return that._parseDevices(errors);
                        })
                        .then(function (errors) {
                            return that._setReferences(errors);
                        })
                        .then(function (errors) {
                            if (errors.length === 0) {
                                errors = null;
                            }
                            resolve(errors);
                        });
                }
            }
        });
    }

    _parseHotel(errors) {
        var that = this;
        return new Promise(function (resolve) {
            var newHotel = Hotel.model();
            newHotel.name = that.config.hotel.name;
            newHotel.save(function (error) {
                if (error) {
                    errors.push(error);
                }
                resolve(errors);
            });
        })
    }

    _parseRooms(errors) {
        var that = this;
        return new Promise(function (resolve) {
            if (!that.config.hotel.hasOwnProperty('rooms')) {
                resolve(errors);
            }
            else {
                logger.debug("Room-cfg existing, adding to db.");
                var hotel;

                Hotel.model.findOne({name: that.config.hotel.name}, function (error, result) {
                    if (error) {
                        errors.push(error);
                    }
                    hotel = result;

                    if (!hotel) {
                        errors.push(new Error("Hotel missing in db. Inconsistent data. Not able to link hotel->rooms."));
                    }

                    async.each(that.config.hotel.rooms, function (cfg_room, callback2) {
                            var room = Room.model();
                            room.name = cfg_room.name;
                            room.isBooked = cfg_room.isBooked;
                            room.members = cfg_room.members;
                            room.save(function (error) {
                                if (error) {
                                    errors.push(error);
                                }
                                logger.debug("Added room '%s'", cfg_room.name);
                                if (hotel) {
                                    hotel.rooms.push(room); //Add room to hotel-list
                                    logger.debug("Added %s to %s.rooms[]", room.name, hotel.name);
                                }
                                callback2();
                            });

                        },
                        function () {
                            if (hotel) {
                                hotel.save(function (error) {
                                    if (error) {
                                        errors.push(error);
                                    }
                                    resolve(errors);
                                })
                            }
                            else {
                                resolve(errors);
                            }
                        }
                    );
                });
            }
        });
    }

    _parseDevices(errors) {
        var that = this;
        return new Promise(function (resolve) {
            if (!that.config.hotel.hasOwnProperty('devices')) {
                resolve(errors);
            }
            else {
                logger.debug("Device-cfg existing, adding to db.");

                async.each(that.config.hotel.devices, function (cfg_device, callback2) {
                    var device = Device.model();
                    device.name = cfg_device.name;
                    device.save(function (error) {
                        if (error) {
                            errors.push(error);
                        }
                        logger.debug("Added device '%s'", cfg_device.name);
                        callback2();
                    });
                }, function () {
                    resolve(errors);
                });
            }
        });

    }

    _setReferences(errors) {
        var that = this;
        return new Promise(function (resolve) {
            logger.debug("Establishing db-references");
            async.each(that.config.hotel.devices, function (cfg_device, callback) {
                if (!cfg_device.hasOwnProperty('room')) {
                    logger.debug("Device '%s' has no room-reference. Skipping...", cfg_device.name);
                    return callback();
                }
                Room.model.findOne({name: cfg_device.room}, function (error, room) {
                    if (error) {
                        errors.push(new Error("Error while querying db", error));
                        return callback();
                    }
                    if (!room) {
                        errors.push(new Error("Invalid reference '" + cfg_device.name + "." + cfg_device.room + "'! Room '" + cfg_device.room + "' not found."));
                        return callback();
                    }
                    Device.model.findOne({name: cfg_device.name}, function (error, device) {
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

                        device.save(function (error) {
                            if (error) {
                                errors.push(error);
                                return callback();
                            }
                            room.save(function (error) {
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
            }, function () {
                resolve(errors);
            });
        });
    }


    /*
     register type:Boolean - Register or de-register device
     */
    registerDevice(deviceName, register) {
        return new Promise(function (resolve, reject) {
            if (typeof register !== 'boolean') {
                reject(new Error("Invalid param. register, boolean expected."));
            }
            Device.model.findOne({name: deviceName}, function (error, device) { //Get device by name
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

                    device.save(function (error) {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                }
            });
        });
    }
}

export default Database;