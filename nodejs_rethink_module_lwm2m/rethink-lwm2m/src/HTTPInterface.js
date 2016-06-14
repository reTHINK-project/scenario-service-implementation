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
import logger from "logops";
import util from "./Util";
import mapping from "./lwm2m-mapping";

class HTTPInterface {

    constructor(host, port, keyFile, certFile, database, lwm2m) {
        this._host = host;
        this._port = port;
        this._keyFile = keyFile;
        this._certFile = certFile;
        this._database = database;
        this._lwm2m = lwm2m;
        this._server = {};
    }

    _getCertFiles(keyFile, certFile) {
        return new Promise((resolve, reject) => {
            if (typeof keyFile === "undefined" || typeof certFile === "undefined") {
                reject(new Error("Invalid path to cert-files!"));
            }
            else {
                var options = {};
                util.readFile(keyFile)
                    .catch(reject)
                    .then((key) => {
                        options.key = key;
                        return util.readFile(certFile);
                    })
                    .catch(reject)
                    .then((cert) => {
                        options.cert = cert;
                        resolve(options);
                    });
            }
        });
    }

    //TODO: Refactor: use "enum"
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
            try {
                json.error += ": " + JSON.stringify(msg);
            }
            catch (e) { //In case stringify fails
            }
        }
        return json;
    }

    _processRequest(params) {
        var that = this;
        return new Promise((resolve) => {
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
                    }
                    else {
                        if (params.hasOwnProperty("device")) {
                            objectType = "device";
                            objectName = params.device;
                        }
                    }

                    if (objectType === null) {
                        reply.error = HTTPInterface._getErrorReply("unsupportedParam", "Please specify which data to read");
                        resolve(reply);
                    }
                    else {
                        that._database.getObject(objectType, objectName)
                            .catch((error) => {
                                reply.error = HTTPInterface._getErrorReply(null, error);
                                reply.error = error;
                                resolve(reply);
                            })
                            .then((queriedObject) => {
                                reply.data = queriedObject;
                                resolve(reply); //Convert to string for network
                            });
                    }
                }
                else {
                    //Example: myRaspberry, light, 1, dimmer, 75.0
                    if (params.hasOwnProperty("deviceName")
                        && params.hasOwnProperty("objectType")
                        && params.hasOwnProperty("objectId")
                        && params.hasOwnProperty("resourceType")
                        && params.hasOwnProperty("value")) {

                        that._write(params.deviceName, params.objectType, params.objectId, params.resourceType, params.value)
                            .catch((error) => {
                                reply.error = HTTPInterface._getErrorReply(null, error); //TODO: specific error message
                                resolve(reply);
                            })
                            .then(() => {
                                resolve(reply); //If no error on write, leave all fields null
                            })
                    }
                    else {
                        reply.error = HTTPInterface._getErrorReply("unsupportedParam", "Write must include 'deviceName'," +
                            "'objectType', 'objectId', 'resourceType', 'value'.");
                        resolve(reply);
                    }
                }
            }
            else {
                reply.error = HTTPInterface._getErrorReply("unsupportedParam", "Please either provide read or write-object!");
                resolve(reply);
            }

        });
    }

    _write(deviceName, objectType, objectId, resourceType, value) {
        var that = this;
        return new Promise((resolve, reject) => {
            var ids = mapping.getAttrId(objectType, resourceType);
            if (ids === null) {
                reject(new Error("Invalid objectType or resourceType"));
            }
            else {
                util.write(that._lwm2m, deviceName, ids.objectTypeId, objectId, ids.resourceTypeId, value)
                    .catch((error) => {
                        reject(error);
                    })
                    .then(resolve);
            }
        });
    }

    _listen(options) {
        var that = this;
        return new Promise((resolve) => {
            that._server = https.createServer(options, (req, res) => {
                let head = {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                if (req.method != "POST") {
                    logger.debug("HTTPInterface: Invalid method from [" + req.headers.host + "]: " + req.method);
                    res.writeHead(405, head);
                    res.end(JSON.stringify(HTTPInterface._getErrorReply("invalidMethod", "Use POST")));
                }
                else {
                    var body = "";
                    var bodyValid;
                    req.on("data", (data) => {
                        body += data;
                    });
                    req.on("end", () => {
                        bodyValid = true;
                        logger.debug("HTTPInterface: Received data from [" + req.headers.host + "]", body);
                        try {
                            var params = JSON.parse(body);
                        }
                        catch (e) {
                            res.writeHead(415, head);
                            res.end(JSON.stringify(HTTPInterface._getErrorReply("invalidBody", e)));
                            bodyValid = false;
                        }
                        if (bodyValid) {
                            that._processRequest(params) //Process request and ...
                                .then((reply) => {
                                    reply = JSON.stringify(reply);
                                    logger.debug("HTTPInterface: Sending data to [" + req.headers.host + "]", reply);
                                    res.writeHead(200, head);
                                    res.end(reply); //... reply to client
                                });
                        }
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