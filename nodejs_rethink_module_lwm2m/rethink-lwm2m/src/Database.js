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

    constructor(host = 'localhost', dbname = 'hotel') {
        this._host = host;
        this._dbname = dbname;
        this.db = db;
    }

    connect(callback) {
        if (!this.connected()) {
            db.init(this._host, this._dbname, function () {
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

    //TODO: sync?, improve check? Could compare db-attributes with cfg-attr.
    isInitialised(callback) {
        this.db.connection.db.listCollections({name: 'hotels'}) //appended 's' is mongoose-behavior, see: http://bit.ly/1Lq65AJ)
            .next(function (err, collinfo) {
                callback(typeof collinfo !== 'undefined' && collinfo !== null, err);
            });
    }

    get connection() {
        return db.connection;
    }

    //TODO: Object-references (Device needs room assigned etc.)
    //TODO: Proper error-handling (improve callbacks)
    createHotel(config, callback) {
        if (typeof config === 'undefined') {
            return callback(new Error("Missing config!"));
        }
        else {
            if (!this.connected()) {
                return callback(new Error("Can't save data to db! Not connected!"));
            }
            else {

                async.parallel([
                    function parseHotel(callback) {
                        var newHotel = Hotel.model();

                        newHotel.name = config.name;

                        newHotel.save(function (error) {
                            if (error) {
                                logger.error(error);
                                return callback();
                            }
                        });
                    },
                    function parseRooms(callback) {
                        if (typeof config.rooms !== 'undefined') {
                            logger.debug("Room-cfg existing, adding to db.");

                            config.rooms.forEach(function (cfg_room) {
                                var room = Room.model();
                                room.name = cfg_room.name;
                                room.isBooked = cfg_room.isBooked;
                                room.members = cfg_room.members;
                                room.save(function (error) {
                                    if (error) {
                                        logger.error(error);
                                        return callback();
                                    }
                                })
                            });
                        }
                    },

                    function parseDevices() {
                        if (typeof config.devices !== 'undefined') {
                            logger.debug("Device-cfg existing, adding to db.");
                            config.devices.forEach(function (cfg_device) {
                                var device = Device.model();
                                device.name = cfg_device.name;
                                device.save(function (error) {
                                    if (error) {
                                        logger.error(error);
                                        return callback();
                                    }
                                })
                            });
                        }
                    }
                ], function () {
                    callback();
                });
            }
        }
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