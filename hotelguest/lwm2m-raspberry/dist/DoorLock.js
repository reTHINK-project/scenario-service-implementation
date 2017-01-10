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

var _Util = require("./Util");

var _Util2 = _interopRequireDefault(_Util);

var _lwm2mMapping = require("./lwm2m-mapping");

var _lwm2mMapping2 = _interopRequireDefault(_lwm2mMapping);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DoorLock = function () {
    function DoorLock(lwm2m) {
        _classCallCheck(this, DoorLock);

        this._lwm2m = lwm2m;
    }

    _createClass(DoorLock, [{
        key: "start",
        value: function start() {
            //Create lwm2m-object/s //TODO support multiple door locks
            var that = this;
            return new Promise(function (resolve, reject) {
                var obj = "/" + _lwm2mMapping2.default.getAttrId("actuator").objectTypeId + "/" + 0;

                _Util2.default.createClientObject(that._lwm2m, obj).catch(function (error) {
                    reject(error);
                }).then(function () {
                    //FIXME: cascading promises :(
                    _Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("actuator", "isOn").resourceTypeId, "false") //Default locked, todo: configurable
                    .catch(function (error) {
                        reject(error);
                    }).then(function () {
                        _Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("actuator", "name").resourceTypeId, "Door") //Default name, todo: configurable
                        .catch(function (error) {
                            reject(error);
                        }).then(function () {
                            _Util2.default.setClientResource(that._lwm2m, obj, _lwm2mMapping2.default.getAttrId("actuator", "applicationType").resourceTypeId, "doorLock").catch(function (error) {
                                reject(error);
                            }).then(function () {
                                resolve();
                            });
                        });
                    });
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
                _logops2.default.debug("DoorLock handleWrite:", objectType, objectId, resourceId, value);
                if (objectType != _lwm2mMapping2.default.getAttrId("actuator").objectTypeId) {
                    reject(new Error("Invalid objectType for DoorLock!"));
                } else {
                    var attr = _lwm2mMapping2.default.getAttrName(objectType, resourceId);
                    if (attr == null) {
                        reject(new Error("Unknown operation for resourceId " + resourceId + ", objectType " + objectType));
                    } else {
                        //No actions needed => Virtual actuator =>  data is handled by lwm2m client object
                        resolve();
                    }
                }
            });
        }
    }]);

    return DoorLock;
}();

exports.default = DoorLock;
//# sourceMappingURL=DoorLock.js.map