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

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

var _Util = require("./Util");

var _Util2 = _interopRequireDefault(_Util);

var _lwm2mMapping = require("./lwm2m-mapping");

var _lwm2mMapping2 = _interopRequireDefault(_lwm2mMapping);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var interfaceError = Object.freeze({
    invalidJSON: "Invalid JSON-String",
    invalidHTTPMethod: "HTTP-Method not supported",
    writeFail: "LWM2M-write failed",
    database: "Database error",
    unsupportedParam: "Unsupported parameter",
    unknown: "Unknown"
});

//HTTP-to-CoAP Mapping (https://tools.ietf.org/html/draft-ietf-core-http-mapping-10#section-7)
var coapToHTTP = Object.freeze({
    "2.01": 201, "2.02": 200, "2.03": 200, "2.04": 200, "2.05": 200, "4.00": 400, "4.01": 403, "4.02": 500, "4.03": 403,
    "4.04": 404, "4.05": 400, "4.06": 406, "4.12": 412, "4.13": 413, "4.15": 415, "5.00": 500, "5.01": 501, "5.02": 502,
    "5.03": 503, "5.04": 504, "5.05": 502
});

var HTTPInterface = function () {
    function HTTPInterface(host, port, keyFile, certFile, database, lwm2m) {
        _classCallCheck(this, HTTPInterface);

        this._host = host;
        this._port = port;
        this._keyFile = keyFile;
        this._certFile = certFile;
        this._database = database;
        this._lwm2m = lwm2m;
        this._server = {};
    }

    _createClass(HTTPInterface, [{
        key: "_getCertFiles",
        value: function _getCertFiles(keyFile, certFile) {
            return new Promise(function (resolve, reject) {
                if (typeof keyFile === "undefined" || typeof certFile === "undefined") {
                    reject(new Error("Invalid path to cert-files!"));
                } else {
                    var options = {};
                    _Util2.default.readFile(keyFile).catch(reject).then(function (key) {
                        options.key = key;
                        return _Util2.default.readFile(certFile);
                    }).catch(reject).then(function (cert) {
                        options.cert = cert;
                        resolve(options);
                    });
                }
            });
        }
    }, {
        key: "_processRequest",
        value: function _processRequest(params) {
            var that = this;
            return new Promise(function (resolve) {
                var reply = {};
                reply.data = null;
                reply.error = null;
                var objectType = null;
                var objectName = null;

                if (params.hasOwnProperty("mode") && (params.mode === "read" || params.mode === "write")) {
                    if (params.mode === "read") {
                        //READ
                        if (params.hasOwnProperty("room")) {
                            objectType = "room";
                            objectName = params.room;
                        } else {
                            if (params.hasOwnProperty("device")) {
                                objectType = "device";
                                objectName = params.device;
                            }
                        }

                        if (objectType === null) {
                            reply.error = HTTPInterface._getErrorReply(interfaceError.unsupportedParam, "Please specify which data to read");
                            resolve(reply);
                        } else {
                            that._database.getObject(objectType, objectName).catch(function (error) {
                                reply.error = HTTPInterface._getErrorReply(interfaceError.database, error);
                                reply.error = error;
                                resolve(reply);
                            }).then(function (queriedObject) {
                                reply.data = queriedObject;
                                resolve(reply);
                            });
                        }
                    } else {
                        //Example: myRaspberry, light, 1, dimmer, 75.0
                        if (params.hasOwnProperty("deviceName") && params.hasOwnProperty("objectType") && params.hasOwnProperty("objectId") && params.hasOwnProperty("resourceType") && params.hasOwnProperty("value")) {
                            if (typeof params.value !== "string") {
                                params.value = JSON.stringify(params.value);
                            }
                            var httpCode;
                            that._write(params.deviceName, params.objectType, params.objectId, params.resourceType, params.value).catch(function (error) {
                                if (typeof error.code !== "undefined" && error.code !== null) {
                                    //if present, translate coap error-code to http
                                    httpCode = coapToHTTP[error.code];
                                }
                                reply.error = HTTPInterface._getErrorReply(interfaceError.writeFail, error);
                                resolve([reply, httpCode]);
                            }).then(function () {
                                resolve(reply); //If no error on write, leave all fields null
                            });
                        } else {
                            reply.error = HTTPInterface._getErrorReply(interfaceError.unsupportedParam, "Write must include 'deviceName'," + "'objectType', 'objectId', 'resourceType', 'value'.");
                            resolve(reply);
                        }
                    }
                } else {
                    reply.error = HTTPInterface._getErrorReply(interfaceError.unsupportedParam, "Expected 'read' or 'write' for parameter 'mode'.");
                    resolve(reply);
                }
            });
        }
    }, {
        key: "_write",
        value: function _write(deviceName, objectType, objectId, resourceType, value) {
            var that = this;
            return new Promise(function (resolve, reject) {
                var ids = _lwm2mMapping2.default.getAttrId(objectType, resourceType);
                if (ids === null) {
                    reject(new Error("Invalid objectType or resourceType"));
                } else {
                    if (ids.readOnly === true) {
                        reject(new Error("Resource '" + resourceType + "' of objectType '" + objectType + "' is read-only"));
                    } else {
                        _Util2.default.write(that._lwm2m, deviceName, ids.objectTypeId, objectId, ids.resourceTypeId, value).catch(function (error) {
                            reject(error);
                        }).then(resolve);
                    }
                }
            });
        }
    }, {
        key: "_listen",
        value: function _listen(options) {
            var that = this;
            return new Promise(function (resolve) {
                that._server = _https2.default.createServer(options, function (req, res) {
                    var head = {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    };
                    if (req.method != "POST") {
                        _logops2.default.debug("HTTPInterface: Invalid method from [" + req.headers.host + "]: " + req.method);
                        res.writeHead(405, head);
                        res.end(JSON.stringify(HTTPInterface._getErrorReply(interfaceError.invalidHTTPMethod, "Use POST")));
                    } else {
                        var body = "";
                        var bodyValid;
                        req.on("data", function (data) {
                            body += data;
                        });
                        req.on("end", function () {
                            bodyValid = true;
                            _logops2.default.debug("HTTPInterface: Received data from [" + req.connection.remoteAddress + "]", body);
                            try {
                                var params = JSON.parse(body);
                            } catch (e) {
                                res.writeHead(415, head);
                                res.end(JSON.stringify(HTTPInterface._getErrorReply(interfaceError.invalidJSON, e)));
                                bodyValid = false;
                            }
                            if (bodyValid) {
                                that._processRequest(params) //Process request and ...
                                .then(function (result) {
                                    var reply, errorCode;
                                    if (result instanceof Array) {
                                        reply = result[0];
                                        errorCode = result[1];
                                    } else {
                                        reply = result;
                                    }
                                    if (typeof reply.error === "undefined" || reply.error === null) {
                                        res.writeHead(200, head); //all OK
                                    } else {
                                        if (typeof errorCode !== "undefined" && errorCode !== null) {
                                            res.writeHead(errorCode, head); //Error from coap
                                        } else {
                                            res.writeHead(500, head); //Unknown error
                                        }
                                    }
                                    reply = JSON.stringify(reply);
                                    _logops2.default.debug("HTTPInterface: Sending data to [" + req.connection.remoteAddress + "]", reply);
                                    res.end(reply); //... reply to client
                                });
                            }
                        });
                    }
                });

                that._server.listen(that._port, that._host, function () {
                    _logops2.default.debug("HTTPInterface: Listening at https://" + that._host + ":" + that._port);
                    resolve();
                });
            });
        }
    }, {
        key: "open",
        value: function open() {
            var that = this;
            this._opened = new Promise(function (resolve, reject) {
                that._getCertFiles(that._keyFile, that._certFile).catch(reject).then(function (options) {
                    return that._listen(options);
                }).then(resolve);
            });
            return this._opened;
        }
    }, {
        key: "close",
        value: function close() {
            var that = this;
            return new Promise(function (resolve, reject) {
                Promise.all([that._opened]) //Wait for start before stop
                .then(function () {
                    that._server.close(function (error) {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                });
            });
        }
    }], [{
        key: "_getErrorReply",
        value: function _getErrorReply(errorType, msg) {
            var json = {};

            //1st param (error type from enum interfaceError)
            for (var key in interfaceError) {
                if (interfaceError.hasOwnProperty(key) && errorType === interfaceError[key]) {
                    json.error = interfaceError[key];
                }
            }
            if (typeof json.error === "undefined" || json.error === null) {
                //Invalid value for param 'error'
                json.error = interfaceError.unknown;
            }
            //2nd param (custom message)
            if (typeof msg !== "undefined" && msg !== null) {
                try {
                    if (!(msg instanceof Error)) {
                        //Do not attempt to stringify Error-objects. Always results in {}.
                        msg = JSON.stringify(msg);
                    }
                    json.error += ": " + msg;
                } catch (e) {//stringify fail
                }
            }

            //Return assembled error-message (json format)
            return json;
        }
    }]);

    return HTTPInterface;
}();

exports.default = HTTPInterface;
//# sourceMappingURL=HTTPInterface.js.map