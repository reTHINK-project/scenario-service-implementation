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

var _philipsHue = require("philips-hue");

var _philipsHue2 = _interopRequireDefault(_philipsHue);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Hue = function () {
    function Hue(lwm2m, bridge, username) {
        _classCallCheck(this, Hue);

        this._lwm2m = lwm2m;
        this._hue = new _philipsHue2.default();
        this._hue.bridge = bridge;
        this._hue.username = username;
    }

    _createClass(Hue, [{
        key: "start",
        value: function start() {
            var _this = this;

            //Get all lights and create lwm2m-objects
            var that = this;
            return new Promise(function (resolve, reject) {
                var lights = null;

                _this._hue.getLights().catch(reject).then(function (result) {
                    lights = result;
                    return that._createObjects(lights);
                }).catch(reject).then(function () {
                    resolve(lights);
                });
            });
        }
    }, {
        key: "_createObjects",
        value: function _createObjects(lights) {
            var that = this;
            return new Promise(function (resolve, reject) {
                var errors = [];

                _async2.default.each(Object.keys(lights), function (id, callback) {
                    that._lwm2m.registry.create("/3311/" + id, function (error) {
                        if (error) {
                            errors.push(error);
                        } else {
                            _logops2.default.debug("Hue: Created lwm2m-object for light '" + id + "' '/3311/" + id + "'");
                        }
                        callback();
                    });
                }, function () {
                    if (errors.length > 0) {
                        reject(errors);
                    } else {
                        resolve();
                    }
                }); //Resolve when all objects have been created
            });
        }
    }, {
        key: "stop",
        value: function stop() {
        }
    }, {
        key: "handleWrite",
        value: function handleWrite(objectType, objectId, resourceId, value) {
            var that = this;
            return new Promise(function (resolve, reject) {
                if (objectType != "3311") {
                    reject(new Error("Invalid objectType for hue!"));
                } else {
                    switch (resourceId) {
                        case "5850":
                            //On/off
                            if (value == true) {
                                that._hue.light(objectId).on().catch(reject).then(resolve);
                            } else {
                                that._hue.light(objectId).off().catch(reject).then(resolve);
                            }
                            break;
                        case "5851":
                            //Dimmer (0-100)
                            reject(new Error("Dimmer-control not yet supported"));
                            break;
                        case "5706":
                            //Colour
                            reject(new Error("Colour-control not yet supported"));
                            break;
                        default:
                            reject(new Error("Unknown operation for resourceId " + resourceId));
                            break;
                    }
                }
            });
        }
    }, {
        key: "ctl",
        get: function get() {
            return this._hue;
        }
    }]);

    return Hue;
}();

exports.default = Hue;
//# sourceMappingURL=Hue.js.map