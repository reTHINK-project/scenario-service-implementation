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
        return new Promise((resolve, reject) => {

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
                function done(error) { //TODO: replace with promise.all (wrap file-read operations in promises)
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

    static _getErrorReply(error, msg) {
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
        return JSON.stringify(json); //Convert to String for network
    }

    _processRequest(params) {
        var that = this;
        return new Promise((resolve) => {
            var reply = {};
            reply.data = null;
            reply.error = null;
            var objectType = null;
            var objectName = null;

            if (params.hasOwnProperty("room")) {
                objectType = "room";
                objectName = params.room;
            }
            else {
                if (params.hasOwnProperty("device")) {
                    objectType = "device";
                    objectName = params.device;
                }
            }

            if (objectType === null) {
                reply.error = HTTPInterface._getErrorReply("unsupportedParam");
                resolve(JSON.stringify(reply));
            }
            else {
                that._database.getObject(objectName, objectType)
                    .catch((error) => {
                        reply.error = HTTPInterface._getErrorReply(null, error);
                        reply.error = error;
                        resolve(reply);
                    })
                    .then((queriedObject) => {
                        reply.data = queriedObject;
                        resolve(JSON.stringify(reply)); //Convert to string for network
                    });
            }

        });
    }

    _listen(options) {
        var that = this;
        return new Promise((resolve) => {
            that._server = https.createServer(options, (req, res) => {
                if (req.method != "POST") {
                    logger.debug("HTTPInterface: Invalid method from [" + req.headers.host + "]: " + req.method);
                    res.writeHead(405, {'Content-Type': 'application/json'});
                    res.end(HTTPInterface._getErrorReply("invalidMethod", "Use POST"));
                }
                else {
                    var body = "";
                    req.on("data", (data) => {
                        body += data;
                    });
                    req.on("end", () => {
                        logger.debug("HTTPInterface: Received data from [" + req.headers.host + "]", body);
                        try {
                            var params = JSON.parse(body);
                        }
                        catch (e) {
                            res.writeHead(415, {'Content-Type': 'application/json'});
                            res.end(HTTPInterface._getErrorReply("invalidBody", e));
                        }
                        that._processRequest(params) //Process request and ...
                            .then((reply) => {
                                logger.debug("HTTPInterface: Sending data to [" + req.headers.host + "]", reply);
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.end(reply); //... reply to client
                            });
                    });
                }
            });

            that._server.listen(that._port, that._host, () => {
                logger.debug("HTTPInterface: Listening at https://" + that._host + ":" + that._port);
                resolve();
            });
        });
    }

    open() {
        var that = this;
        this._opened = new Promise((resolve, reject) => {
            that._getCertFiles(that._keyFile, that._certFile)
                .catch(reject)
                .then((options) => {
                    return that._listen(options)
                })
                .then(resolve);
        });
        return this._opened;
    }

    close() {
        var that = this;
        return new Promise((resolve, reject) => {
            Promise.all([that._opened]) //Wait for start before stop
                .then(() => {
                    that._server.close((error) => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                });
        });
    }
}

export default HTTPInterface;