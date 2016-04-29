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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTTPInterface = function () {
    function HTTPInterface(host, port, keyFile, certFile, database) {
        _classCallCheck(this, HTTPInterface);

        this._host = host;
        this._port = port;
        this._keyFile = keyFile;
        this._certFile = certFile;
        this._database = database;
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
        //Convert to String for network
        value: function _processRequest(params) {
            var that = this;
            return new Promise(function (resolve) {
                var reply = {};
                reply.data = null;
                reply.error = null;
                var objectType = null;
                var objectName = null;

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
                    reply.error = HTTPInterface._getErrorReply("unsupportedParam");
                    resolve(JSON.stringify(reply));
                } else {
                    that._database.getObject(objectName, objectType).catch(function (error) {
                        reply.error = HTTPInterface._getErrorReply(null, error);
                        reply.error = error;
                        resolve(reply);
                    }).then(function (queriedObject) {
                        reply.data = queriedObject;
                        resolve(JSON.stringify(reply)); //Convert to string for network
                    });
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
                        res.end(HTTPInterface._getErrorReply("invalidMethod", "Use POST"));
                    } else {
                        var body = "";
                        req.on("data", function (data) {
                            body += data;
                        });
                        req.on("end", function () {
                            _logops2.default.debug("REN WAS HERE2");
                            _logops2.default.debug("HTTPInterface: Received data from [" + req.headers.host + "]", body);
                            try {
                                var params = JSON.parse(body);
                            } catch (e) {
                                res.writeHead(415, head);
                                res.end(HTTPInterface._getErrorReply("invalidBody", e));
                            }
                            that._processRequest(params) //Process request and ...
                            .then(function (reply) {
                                _logops2.default.debug("HTTPInterface: Sending data to [" + req.headers.host + "]", reply);
                                res.writeHead(200, head);
                                res.end(reply); //... reply to client
                            });
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
        value: function _getErrorReply(error, msg) {
            var json = {};
            switch (error) {
                case "invalidBody":
                    json.error = "Invalid JSON-String!";
                    break;
                case "invalidMethod":
                    json.error = "Method not supported";
                    break;
                case "unsupportedParam":
                    json.error = "Unsupported parameter";
                    break;
                default:
                    json.error = "Unknown";
                    break;
            }
            if (typeof msg !== "undefined" && msg !== null) {
                json.error += ": " + msg;
            }
            return JSON.stringify(json);
        }
    }]);

    return HTTPInterface;
}();

exports.default = HTTPInterface;
