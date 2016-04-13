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

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _logops = require("logops");

var _logops2 = _interopRequireDefault(_logops);

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
                    var options;

                    (function () {
                        //noinspection JSAnnotator

                        var done = function done(error) {
                            if (error) {
                                reject(error);
                            }
                            if (options.hasOwnProperty("cert") && options.hasOwnProperty("key")) {
                                resolve(options);
                            }
                        };

                        options = {};


                        _fs2.default.readFile(keyFile, function (error, data) {
                            options.key = data;
                            done(error);
                        });
                        _fs2.default.readFile(certFile, function (error, data) {
                            options.cert = data;
                            done(error);
                        });
                    })();
                }
            });
        }
    }, {
        key: "open",
        value: function open() {
            //TODO: Implement this with POST. Client (hyperty) will specify which data is needed
            var that = this;
            return new Promise(function (resolve, reject) {
                that._getCertFiles(that._keyFile, that._certFile).catch(reject).then(function (options) {
                    that._server = _https2.default.createServer(options, function (req, res) {
                        that._database.getRoom("room1").catch(function (error) {
                            _logops2.default.error(error);
                            res.writeHead(500); //Server error
                        }).then(function (room) {
                            res.writeHead(200);
                            res.end(JSON.stringify(room));
                        });
                    });

                    that._server.listen(that._port, that._host);
                    _logops2.default.debug("HTTPinterface: Listening at https://" + that._host + ":" + that._port);
                    resolve();
                });
            });
        }
    }, {
        key: "close",
        value: function close() {
            var that = this;
            return new Promise(function (resolve, reject) {
                that._server.close(function (error) {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            });
        }
    }]);

    return HTTPInterface;
}();

exports.default = HTTPInterface;
//# sourceMappingURL=HTTPInterface.js.map