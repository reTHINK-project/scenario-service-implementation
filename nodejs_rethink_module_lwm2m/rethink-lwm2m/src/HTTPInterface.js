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
import https from "https";
import fs from "fs";
import logger from "logops";

class HTTPInterface {

    constructor(host, port, keyFile, certFile, database) {
        this._host = host;
        this._port = port;
        this._keyFile = keyFile;
        this._certFile = certFile;
        this._database = database;
        this._server = {};
    }

    _getCertFiles(keyFile, certFile) {
        return new Promise(function (resolve, reject) {

            if (typeof keyFile === "undefined" || typeof certFile === "undefined") {
                reject(new Error("Invalid path to cert-files!"));
            }
            else {
                var options = {};

                fs.readFile(keyFile, (error, data) => {
                    options.key = data;
                    done(error);
                });
                fs.readFile(certFile, (error, data) => {
                    options.cert = data;
                    done(error);
                });
                //noinspection JSAnnotator
                function done(error) {
                    if (error) {
                        reject(error);
                    }
                    if (options.hasOwnProperty("cert") && options.hasOwnProperty("key")) {
                        resolve(options);
                    }
                }
            }
        });
    }

    static _getErrorReply(host, error, msg) {
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
        logger.debug("HTTPInterface error [" + host + "]", json);
        return JSON.stringify(json); //Convert to String for network
    }

    _processRequest(params) {
        var that = this;
        return new Promise((resolve) => {
            var reply = {};
            reply.data = null;
            reply.error = null; //TODO: let _getErrorReply() handle errors

            if (!params.hasOwnProperty("room")) {
                reply.error = "Given parameters not supported!";
            }
            else {
                that._database.getRoom(params.room)
                    .catch((error) => {
                        logger.error("Process POST-request: Error while querying room '" + params.room + "'!", error);
                        reply.error = error;
                        resolve(JSON.stringify(reply))
                    })
                    .then((room) => {
                        reply.data = room;
                        resolve(JSON.stringify(reply));
                    })
            }
        });

    }

    _listen(options) {
        var that = this;
        return new Promise((resolve) => {
            that._server = https.createServer(options, (req, res) => {
                if (req.method != "POST") {
                    res.writeHead(405, {'Content-Type': 'application/json'});
                    res.end(HTTPInterface._getErrorReply(req.headers.host, "invalidMethod", "Use POST"));
                }
                else {
                    logger.debug("POST");

                    var body = "";
                    req.on("data", (data) => {
                        body += data;
                    });
                    req.on("end", () => {
                        logger.debug("Received data", body);
                        try {
                            var params = JSON.parse(body);
                        }
                        catch (e) {
                            res.writeHead(415, {'Content-Type': 'application/json'});
                            res.end(HTTPInterface._getErrorReply(req.headers.host, "invalidBody", e));
                        }
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        that._processRequest(params) //Process request and ...
                            .then((reply) => {
                                res.end(reply);
                            }); //... reply to client
                    });
                }
            });

            that._server.listen(that._port, that._host);
            logger.debug("HTTPinterface: Listening at https://" + that._host + ":" + that._port);
            resolve();
        });
    }

    open() { //TODO: Implement this with POST. Client (hyperty) will specify which data is needed
        var that = this;
        return new Promise((resolve, reject) => {
            that._getCertFiles(that._keyFile, that._certFile)
                .catch(reject)
                .then((options) => {
                    return that._listen(options);
                })
                .then(resolve());
        });
    }

    close() {
        var that = this;
        return new Promise((resolve, reject) => {
            that._server.close(function (error) {
                if (error) {
                    reject(error);
                }
                resolve();
            })
        });
    }
}

export default HTTPInterface;