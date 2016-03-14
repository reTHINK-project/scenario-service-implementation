/**
 * Created by pzu on 11.02.16.
 */
import db from './models/db';
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
        return db.connection;
    }

    connect(callback) {
        if (!this.connected()) {
            db.init(this.config.db.host, this.config.db.database, function () {
                callback();
            })
        }
        else {
            callback(new Error("Already connected or connection pending!"));
        }
    }

    disconnect(callback) {
        if (this.connected()) {
            db.connection.close(function () { //TODO: error-callback?
                callback();
            })
        }
        else {
            callback(new Error("Can't close db-connection: Not connected!"));
        }
    }

    connected() {
        if (typeof db.connection !== 'undefined') {
            return db.connection.readyState === 1 || db.connection.readyState === 2;
        }
        else {
            return false;
        }
    }

    isInitialised(callback) {
        db.connection.db.listCollections({name: 'hotels'}) //appended 's' is mongoose-behavior, see: http://bit.ly/1Lq65AJ)
            .next(function (err, collinfo) {
                callback(typeof collinfo !== 'undefined' && collinfo !== null, err);
            });
    }


    //TODO: Proper error-handling (improve callbacks)
    createHotel(callback) {
        var that = this;

        if (typeof this.config === 'undefined') {
            return callback(new Error("Missing config!"));
        }
        else {
            if (!this.connected()) {
                return callback(new Error("Can't save data to db! Not connected!"));
            }
            else {
                var errors = [];

                that._parseHotel(function (error) {
                    if (error) {
                        errors.push(error);
                    }
                    that._parseRooms(function (error) {
                        if (error) {
                            errors.push(error);
                        }
                        that._parseDevices(function (error) {
                            if (error) {
                                errors.push(error);
                            }
                            that._setReferences(function (error) {
                                if (error) {
                                    errors.push(error);
                                }
                                errors.forEach(function (error) {
                                    logger.debug("Error: ", error);
                                });
                                if (errors.length === 0) {
                                    errors = null;
                                }
                                callback(errors);
                            });
                        });
                    });
                });
            }
        }
    }

    _parseHotel(callback) {
        var newHotel = Hotel.model();
        newHotel.name = this.config.hotel.name;
        newHotel.save(function (error) {
            callback(error);
        });
    }

    _parseRooms(callback) {
        var that = this;
        if (this.config.hotel.hasOwnProperty('rooms')) {
            logger.debug("Room-cfg existing, adding to db.");

            var errors = [];
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
                    function () { //Could stop on first error here
                        if (errors.length === 0) {
                            errors = null;
                        }
                        if (hotel) {
                            hotel.save(function (error) {
                                if (error) { //Could be cleaner
                                    errors = [];
                                    errors.push(error);
                                }
                                callback();
                            })
                        }
                        else {
                            callback(errors);
                        }
                    }
                );
            });
        }
        else {
            callback();
        }
    }

    _parseDevices(callback) {
        if (this.config.hotel.hasOwnProperty('devices')) {
            logger.debug("Device-cfg existing, adding to db.");

            var errors = [];
            async.each(this.config.hotel.devices, function (cfg_device, callback2) {
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
                if (errors.length === 0) {
                    errors = null;
                }
                callback(errors);
            });
        }
        else {
            callback();
        }
    }

    _setReferences(callback) {
        var errors = [];
        logger.debug("Establishing db-references");
        async.each(this.config.hotel.devices, function (cfg_device, callback2) {
            if (cfg_device.hasOwnProperty('room')) {
                Room.model.findOne({name: cfg_device.room}, function (error, room) {
                    if (error) {
                        logger.error("Error while querying db", error);
                    }
                    else {
                        if (!room) {
                            logger.error("Invalid reference '%s.%s'! Room '%s' not found.", cfg_device.name, cfg_device.room, cfg_device.room);
                        }
                        else {
                            Device.model.findOne({name: cfg_device.name}, function (error, device) {
                                if (error) {
                                    logger.error("Error while querying db", error);
                                }
                                else {
                                    if (!device) {
                                        logger.error("Can't set reference, device '%s' not found in db", cfg_device.name);
                                    }
                                    else {
                                        //Bidirectional
                                        device.room = room;
                                        room.devices.push(device);

                                        device.save(function (error) {
                                            if (error) {
                                                errors.push(error);
                                            }
                                            room.save(function (error) {
                                                if (error) {
                                                    errors.push(error);
                                                }
                                                logger.debug("Linked device '%s' to room '%s'", device.name, room.name);
                                                callback2();
                                            })
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
            else {
                logger.debug("Device '%s' has no room-reference. Skipping...", cfg_device.name);
            }
        }, function () {
            if (errors.length === 0) {
                errors = null;
            }
            callback(errors);
        });
    }


    /*
     register type:Boolean - Register or de-register device
     */
    registerDevice(deviceName, register, callback) {
        if (typeof register !== 'boolean') {
            return callback(new Error("Invalid param. register, boolean expected."));
        }

        Device.model.findOne({name: deviceName}, function (error, device) { //Get device by name
            if (error) {
                return callback(error);
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
                        return callback(error);
                    }
                    callback();
                });
            }
        });
    }
}

export default Database;