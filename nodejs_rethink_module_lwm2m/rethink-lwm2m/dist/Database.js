"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
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

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Hotel = require("./models/Hotel");

var _Hotel2 = _interopRequireDefault(_Hotel);

var _Room = require("./models/Room");

var _Room2 = _interopRequireDefault(_Room);

var _Device = require("./models/Device");

var _Device2 = _interopRequireDefault(_Device);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Database = function () {
    function Database(config) {
        _classCallCheck(this, Database);

        this._config = config;
    }

    _createClass(Database, [{
        key: "connect",
        value: function connect() {
            //Assuming Hotel is singleton (in db scope)
            var that = this;
            return new Promise(function (resolve, reject) {
                if (that.connected()) {
                    reject(new Error("Already connected or connection pending!"));
                } else {
                    that._init().then(resolve);
                }
            });
        }
    }, {
        key: "_init",
        value: function _init() {
            var that = this;
            return new Promise(function (resolve) {
                that._connection = _mongoose2.default.createConnection(that.config.db.host, that.config.db.database);
                that.connection.on('error', function mongodbErrorHandler(error) {
                    _logops2.default.fatal('Could not establish connection to mongodb!', error);
                    throw new Error(error);
                });
                that.connection.once('open', function () {
                    _logops2.default.debug('Database.js: connected to mongodb!');
                    _Device2.default.load(that.connection);
                    _Hotel2.default.load(that.connection);
                    _Room2.default.load(that.connection);
                    resolve();
                });
            });
        }
    }, {
        key: "disconnect",
        value: function disconnect() {
            var that = this;
            return new Promise(function (resolve, reject) {
                if (that.connected()) {
                    that.connection.close(function () {
                        resolve();
                    });
                } else {
                    reject(new Error("Can't close db-connection: Not connected!"));
                }
            });
        }
    }, {
        key: "connected",
        value: function connected() {
            if (typeof this.connection !== 'undefined') {
                return this.connection.readyState === 1 || this.connection.readyState === 2;
            } else {
                return false;
            }
        }
    }, {
        key: "isInitialised",
        value: function isInitialised() {
            var that = this;
            return new Promise(function (resolve, reject) {
                if (!that.connected()) {
                    reject(new Error("Not connected to db!"));
                } else {
                    that.connection.db.listCollections({name: 'hotels'}) //appended 's' is mongoose-behavior, see: http://bit.ly/1Lq65AJ)
                        .next(function (err, collinfo) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(typeof collinfo !== 'undefined' && collinfo !== null);
                            }
                        });
                }
            });
        }
    }, {
        key: "createHotel",
        value: function createHotel() {
            var that = this;
            return new Promise(function (resolve, reject) {
                if (typeof that.config === 'undefined') {
                    reject(new Error("Missing config!"));
                } else {
                    if (!that.connected()) {
                        reject(new Error("Can't save data to db! Not connected!"));
                    } else {
                        var errors = [];

                        that._parseHotel(errors).then(function (errors) {
                            return that._parseRooms(errors);
                        }).then(function (errors) {
                            return that._parseDevices(errors);
                        }).then(function (errors) {
                            return that._setReferences(errors);
                        }).then(function (errors) {
                            if (errors.length === 0) {
                                errors = null;
                            }
                            resolve(errors);
                        });
                    }
                }
            });
        }
    }, {
        key: "_parseHotel",
        value: function _parseHotel(errors) {
            var that = this;
            return new Promise(function (resolve) {
                var newHotel = _Hotel2.default.model();
                newHotel.name = that.config.hotel.name;
                newHotel.save(function (error) {
                    if (error) {
                        errors.push(error);
                    }
                    resolve(errors);
                });
            });
        }
    }, {
        key: "_parseRooms",
        value: function _parseRooms(errors) {
            var that = this;
            return new Promise(function (resolve) {
                if (!that.config.hotel.hasOwnProperty('rooms')) {
                    resolve(errors);
                } else {
                    _logops2.default.debug("Room-cfg existing, adding to db.");
                    var hotel;

                    _Hotel2.default.model.findOne({name: that.config.hotel.name}, function (error, result) {
                        if (error) {
                            errors.push(error);
                        }
                        hotel = result;

                        if (!hotel) {
                            errors.push(new Error("Hotel missing in db. Inconsistent data. Not able to link hotel->rooms."));
                        }

                        _async2.default.each(that.config.hotel.rooms, function (cfg_room, callback2) {
                            var room = _Room2.default.model();
                            room.name = cfg_room.name;
                            room.isBooked = cfg_room.isBooked;
                            room.members = cfg_room.members;
                            room.save(function (error) {
                                if (error) {
                                    errors.push(error);
                                }
                                _logops2.default.debug("Added room '%s'", cfg_room.name);
                                if (hotel) {
                                    hotel.rooms.push(room); //Add room to hotel-list
                                    _logops2.default.debug("Added %s to %s.rooms[]", room.name, hotel.name);
                                }
                                callback2();
                            });
                        }, function () {
                            if (hotel) {
                                hotel.save(function (error) {
                                    if (error) {
                                        errors.push(error);
                                    }
                                    resolve(errors);
                                });
                            } else {
                                resolve(errors);
                            }
                        });
                    });
                }
            });
        }
    }, {
        key: "_parseDevices",
        value: function _parseDevices(errors) {
            var that = this;
            return new Promise(function (resolve) {
                if (!that.config.hotel.hasOwnProperty('devices')) {
                    resolve(errors);
                } else {
                    _logops2.default.debug("Device-cfg existing, adding to db.");

                    _async2.default.each(that.config.hotel.devices, function (cfg_device, callback2) {
                        var device = _Device2.default.model();
                        device.name = cfg_device.name;
                        device.save(function (error) {
                            if (error) {
                                errors.push(error);
                            }
                            _logops2.default.debug("Added device '%s'", cfg_device.name);
                            callback2();
                        });
                    }, function () {
                        resolve(errors);
                    });
                }
            });
        }
    }, {
        key: "_setReferences",
        value: function _setReferences(errors) {
            var that = this;
            return new Promise(function (resolve) {
                _logops2.default.debug("Establishing db-references");
                _async2.default.each(that.config.hotel.devices, function (cfg_device, callback) {
                    if (!cfg_device.hasOwnProperty('room')) {
                        _logops2.default.debug("Device '%s' has no room-reference. Skipping...", cfg_device.name);
                        return callback();
                    }
                    _Room2.default.model.findOne({name: cfg_device.room}, function (error, room) {
                        if (error) {
                            errors.push(new Error("Error while querying db", error));
                            return callback();
                        }
                        if (!room) {
                            errors.push(new Error("Invalid reference '" + cfg_device.name + "." + cfg_device.room + "'! Room '" + cfg_device.room + "' not found."));
                            return callback();
                        }
                        _Device2.default.model.findOne({name: cfg_device.name}, function (error, device) {
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
                                    _logops2.default.debug("Linked device '%s' to room '%s'", device.name, room.name);
                                    callback();
                                });
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

    }, {
        key: "registerDevice",
        value: function registerDevice(deviceName, register, payload) {
            return new Promise(function (resolve, reject) {
                if (typeof register !== 'boolean') {
                    reject(new Error("Invalid param. register, boolean expected."));
                }
                _Device2.default.model.findOne({name: deviceName}, function (error, device) {
                    //Get device by name
                    if (error) {
                        reject(error);
                    } else {
                        if (!device) {
                            _logops2.default.debug("Device not existing in db, creating ...");

                            device = _Device2.default.model();
                            device.name = deviceName;
                        }

                        device.registration.registered = register;
                        if (register) device.registration.timestamp = Date.now();

                        //Set / remove payload if given
                        if (register === true) {
                            if (typeof payload !== 'undefined' && payload !== null) device.registration.payload = payload;
                        } else {
                            device.registration.payload = null;
                        }

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
    }, {
        key: "storeValue",
        value: function storeValue(deviceName, uri, value) {
            return new Promise(function (resolve, reject) {
                _Device2.default.model.findOne({name: deviceName}, function (error, device) {
                    if (error) {
                        reject(error);
                    } else {
                        if (!device) {
                            reject(new Error("Can't store value in db for device '" + deviceName + "'! Device not found!"));
                        } else {
                            var data = {};
                            var pushNew = true;

                            data.timestamp = Date.now();
                            data.uri = uri;
                            data.value = value;

                            if (device.lastValues.length > 0) {
                                device.lastValues.forEach(function (currValue) {
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

                            device.save(function (error) {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    }
                });
            });
        }
    }, {
        key: "config",
        set: function set(config) {
            this._config = config;
        },
        get: function get() {
            return this._config;
        }
    }, {
        key: "connection",
        get: function get() {
            return this._connection;
        }
    }]);

    return Database;
}();

exports.default = Database;
//# sourceMappingURL=Database.js.map