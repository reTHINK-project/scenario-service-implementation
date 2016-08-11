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

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util = {};

util.readFile = function (file) {
    return new Promise(function (resolve, reject) {
        _fs2.default.readFile(file, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
};

util.setNestedValue = function (obj, keystr, value) {
    var dest = obj;
    var arr = keystr.split(".");
    var i = 0;
    for (; i < arr.length - 1; i++) {
        if (typeof dest[arr[i]] === "undefined") {
            dest[arr[i]] = {};
        }
        dest = dest[arr[i]];
    }
    dest[arr[i]] = value;
};

util.write = function (lwm2m, deviceName, objectTypeId, objectId, resourceTypeId, value) {
    return new Promise(function (resolve, reject) {
        if (lwm2m === null || typeof lwm2m === "undefined") {
            reject(new Error("lwm2m-object undefined!"));
        } else {
            lwm2m.server.getRegistry().getByName(deviceName, function (error, device) {
                if (error) {
                    reject(error);
                } else {
                    lwm2m.server.write(device.id, objectTypeId, objectId, resourceTypeId, value, function (error) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        }
    });
};

exports.default = util;
//# sourceMappingURL=Util.js.map