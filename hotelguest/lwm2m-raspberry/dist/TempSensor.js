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

var _ds18b = require("ds18b20");

var _ds18b2 = _interopRequireDefault(_ds18b);

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

var TempSensor = function () {
    function TempSensor(client) {
        var refreshInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;

        _classCallCheck(this, TempSensor);

        this._client = client;
        this._refreshInterval = refreshInterval;
        this._objectTypeId = _lwm2mMapping2.default.getAttrId("temperature").objectTypeId;
    }

    _createClass(TempSensor, [{
        key: "start",
        value: function start() {
            var _this = this;

            var that = this;
            return new Promise(function (resolve, reject) {
                if (!that._client || typeof that._client === "undefined") {
                    reject(new Error("lwm2m-client object not set"));
                } else {
                    //Get sensors
                    _ds18b2.default.sensors(function (error, ids) {
                        if (error) {
                            reject(error);
                        } else {
                            if (typeof ids === "undefined" || ids.length === 0) {
                                reject(new Error("No temperature sensor/s found!"));
                            }

                            _logops2.default.debug("Found sensor/s!", ids);
                            _this._sensors = ids;

                            //For each sensor, create client object for lwm2m
                            var index = 0;
                            var errors = [];
                            _async2.default.each(ids, function (id, callback) {
                                _Util2.default.createClientObject(that._client, "/" + that._objectTypeId + "/" + index).catch(reject).then(function () {
                                    return _Util2.default.setClientResource(that._client, "/" + that._objectTypeId + "/" + index, _lwm2mMapping2.default.getAttrId("temperature", "unit").resourceTypeId, "Cel"); //Set temperature object unit
                                }).catch(function (error) {
                                    if (error) {
                                        errors.push(error);
                                    }
                                }).then(function (result) {
                                    _logops2.default.debug("Set unit", result);
                                    index++;
                                    callback();
                                });
                            }, function () {
                                //When all sensor-objects have been created

                                //Initial temperature-read
                                that._setClientTemp(that);
                                //Start timer for updating sensor-object with temperature-values
                                that._timer = setInterval(that._setClientTemp, that._refreshInterval, that);

                                if (errors.length > 0) {
                                    reject(errors);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        }
    }, {
        key: "stop",
        value: function stop() {
            if (this._timer) {
                clearInterval(this._timer);
            }
        }
    }, {
        key: "_setClientTemp",
        value: function _setClientTemp(that) {
            var index = 0;
            var errors = [];
            var resourceTypeId = _lwm2mMapping2.default.getAttrId("temperature", "value").resourceTypeId;

            _async2.default.each(that._sensors, function (id, callback) {
                _ds18b2.default.temperature(id, function (error, value) {
                    if (error) {
                        _logops2.default.error(error);
                        errors.push(error);
                    } else {
                        _logops2.default.debug("Sensor '" + id + "': " + value);
                        _logops2.default.debug("Setting values in lwm2m-client");

                        Promise.all([_Util2.default.setClientResource(that._client, "/" + that._objectTypeId + "/" + index, resourceTypeId, value)]).then(function (results) {
                            _logops2.default.debug("Set values", results);
                            index++;
                            callback();
                        }, function (error) {
                            if (error) {
                                errors.push(error);
                            }
                            index++;
                            callback();
                        });
                    }
                });
            }, function () {
                if (errors.length > 0) {
                    _logops2.default.error("Error/s while storing temperature!", errors);
                }
            });
        }
    }, {
        key: "sensors",
        get: function get() {
            return this._sensors;
        }
    }]);

    return TempSensor;
}();

exports.default = TempSensor;
//# sourceMappingURL=TempSensor.js.map