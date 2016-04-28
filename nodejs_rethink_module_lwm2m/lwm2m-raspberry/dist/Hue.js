"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
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

var _Util = require("./Util");

var _Util2 = _interopRequireDefault(_Util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
                    return that._initObjects(lights);
                }).catch(reject).then(function () {
                    resolve(lights);
                });
            });
        }
    }, {
        key: "_initObjects",
        value: function _initObjects(lights) {
            var that = this;
            return new Promise(function (resolve, reject) {
                var errors = [];

                _async2.default.each(Object.keys(lights), function (id, callback) {

                    //Create lwm2m-client object to store lamp-data (Object/Resources according to IPSO Standard)
                    _Util2.default.createClientObject(that._lwm2m, "/3311/" + id).catch(function (error) {
                        if (error) {
                            errors.push(error);
                        }
                    }).then(function () {
                        var obj = "/3311/" + id;
                        var state = lights[id].state;
                        var setVal = [];
                        _logops2.default.debug("Hue: Created lwm2m-object for light '" + id + "' '/3311/" + id + "'");

                        //Get initial light info and set resources

                        //On/off state
                        setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, 5850, state.on ? 1 : 0));

                        //Brightness / Dimmer
                        setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, 5851, _Util2.default.convertRangeRound(state.bri, [1, 254], [1, 100])));

                        //Color
                        //Only set color if bulb supports it //TODO: Verify check
                        if (state.xy) {
                            setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, 5706, JSON.stringify(state.xy))); //CIE-coords in json format
                            setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, 5701, "CIE_JSON")); //TODO: might have to wrap in {} for valid JSON
                            //Philips-hue uses coordinates in C.I.E for colors: http://www.developers.meethue.com/documentation/core-concepts
                        }

                        Promise.all(setVal) //TODO: replace with different structure, don't cancel on first reject
                        .catch(function (error) {
                            errors.push(error);
                            callback();
                        }).then(function (results) {
                            _logops2.default.debug("Hue Set initial light-info: light '" + id + "'", results);
                            callback();
                        });
                    });
                }, function () {
                    if (errors.length > 0) {
                        reject(errors);
                    } else {
                        resolve(); //Resolve when all objects have been created (for-each is done)
                    }
                });
            });
        }
    }, {
        key: "stop",
        value: function stop() {}
    }, {
        key: "handleWrite",
        value: function handleWrite(objectType, objectId, resourceId, value) {
            var that = this;
            return new Promise(function (resolve, reject) {
                if (objectType !== "3311") {
                    reject(new Error("Invalid objectType for hue!"));
                } else {
                    switch (resourceId) {
                        case "5850":
                            //On/off
                            that._setOnState(objectId, value).catch(reject).then(resolve);
                            break;
                        case "5851":
                            //Dimmer (1-100) //TODO: Support 0 as minimum. This should turn off the bulb
                            if (value >= 1 && value <= 100) {
                                var briState = {};
                                briState.bri = _Util2.default.convertRangeRound(value, [1, 100], [1, 254]);
                                that._hue.light(objectId).setState(briState).catch(reject).then(function () {
                                    _logops2.default.debug("Hue: Light " + objectId + ": BRI", briState);
                                    resolve();
                                });
                            } else {
                                reject(new Error("Invalid value-range for brightness. Expected 1-100"));
                            }
                            break;
                        case "5706":
                            //Colour
                            try {
                                var colorCoord = JSON.parse(value);
                                if (!colorCoord.hasOwnProperty("length") || !(colorCoord.length === 2)) {
                                    //Test if array [x,y]
                                    throw new Error("Invalid coordinate-array! Expected [x,y]");
                                }
                                var colorState = {};
                                colorState.xy = colorCoord;

                                that._hue.light(objectId).setState(colorState).catch(reject).then(function () {
                                    _logops2.default.debug("Hue: Light " + objectId + ": XY", colorState); //FIXME: Also runs on catch
                                    resolve();
                                });
                            } catch (e) {
                                reject(new Error("Error while parsing CIE coordinates for colour: " + e));
                            }
                            break;
                        case "5701":
                            //Unit (Colour)
                            reject(new Error("Resource '5701' (Unit) is read only!"));
                            break;
                        case "5852": //On Time (R,W)
                        case "5805": //Cumulative active power (R)
                        case "5820":
                            //Power factor (R)
                            reject(new Error("Resource not supported!"));
                            break;
                        default:
                            reject(new Error("Unknown operation for resourceId " + resourceId));
                            break;
                    }
                }
            });
        }
    }, {
        key: "_setOnState",
        value: function _setOnState(id, state) {
            var that = this;
            return new Promise(function (resolve, reject) {
                var done;
                if (state == true) {
                    done = that._hue.light(id).on();
                } else {
                    done = that._hue.light(id).off();
                }
                done.catch(reject).then(function () {
                    _logops2.default.debug("Hue: Light " + id + " on: " + state);
                    resolve();
                });
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