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

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _philipsHue = require("philips-hue");

var _philipsHue2 = _interopRequireDefault(_philipsHue);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _Util = require("./Util");

var _Util2 = _interopRequireDefault(_Util);

var _lwm2mMapping = require("./lwm2m-mapping");

var _lwm2mMapping2 = _interopRequireDefault(_lwm2mMapping);

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
                var objectTypeId = _lwm2mMapping2.default.getAttrId("light").objectTypeId;

                _async2.default.each(Object.keys(lights), function (id, callback) {

                    //Create lwm2m-client object to store lamp-data (Object/Resources according to IPSO Standard)
                    _Util2.default.createClientObject(that._lwm2m, "/" + objectTypeId + "/" + id).catch(function (error) {
                        if (error) {
                            errors.push(error);
                        }
                    }).then(function () {
                        var obj = "/" + objectTypeId + "/" + id;
                        var state = lights[id].state;
                        var setVal = [];
                        _logops2.default.debug("Hue: Created lwm2m-object for light '" + id + "' '/" + objectTypeId + "/" + id + "'");

                        //Get initial light info and set resources

                        //Name (Not IPSO compliant. IPSO does not provide field for descriptor)
                        if (lights[id].hasOwnProperty("name")) {
                            setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("light", "name").resourceTypeId, lights[id].name));
                        }

                        //On/off state
                        setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("light", "isOn").resourceTypeId, state.on ? "true" : "false"));

                        //Brightness / Dimmer
                        setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("light", "dimmer").resourceTypeId, _Util2.default.convertRangeRound(state.bri, [1, 254], [1, 100])));

                        //Color
                        //Only set color if bulb supports it
                        if (state.xy) {
                            setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("light", "color.value").resourceTypeId, JSON.stringify(state.xy))); //CIE-coords in json format
                            setVal.push(_Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("light", "color.unit").resourceTypeId, "CIE_JSON"));
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
                    var attr = _lwm2mMapping2.default.getAttrName(objectType, resourceId);
                    if (attr == null) {
                        reject(new Error("Unknown operation for resourceId " + resourceId + ", objectType " + objectType));
                    } else {
                        switch (attr.resourceType) {
                            case "name":
                                that._hue.light(objectId).setInfo({ "name": value }).catch(reject).then(resolve);
                                break;
                            case "isOn":
                                that._setOnState(objectId, value).catch(reject).then(resolve);
                                break;
                            case "dimmer":
                                //range: 1-100
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
                            case "color.value":
                                var colorCoord = JSON.parse(value);
                                if (!colorCoord.hasOwnProperty("length") || !(colorCoord.length === 2)) {
                                    //Test if array [x,y]
                                    reject(new Error("Invalid coordinate-array! Expected [x,y]"));
                                }
                                var colorState = {};
                                colorState.xy = colorCoord;

                                that._hue.light(objectId).setState(colorState).catch(reject).then(function () {
                                    _logops2.default.debug("Hue: Light " + objectId + ": XY", colorState); //FIXME: Also runs on catch
                                    resolve();
                                });
                                break;
                            case "color.unit":
                                //Unit for color-value
                                reject(new Error("Resource Unit is read only!"));
                                break;
                            case "onTime": //R,W
                            case "cumulativeActivePower": //R
                            case "powerFactor":
                                //R
                                reject(new Error("Resource not supported!"));
                                break;
                        }
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
                try {
                    state = JSON.parse(state);
                } catch (e) {
                    reject(new Error("Hue: _setOnState(): Could not parse on-state"));
                }
                if (state == true || state == 1) {
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