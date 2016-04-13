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


    open() { //TODO: Implement this with POST. Client (hyperty) will specify which data is needed
        var that = this;
        return new Promise((resolve, reject) => {
            that._getCertFiles(that._keyFile, that._certFile)
                .catch(reject)
                .then(options => {
                    that._server = https.createServer(options, (req, res) => {
                        that._database.getRoom("room1")
                            .catch((error) => {
                                logger.error(error);
                                res.writeHead(500); //Server error
                            })
                            .then((room) => {
                                res.writeHead(200);
                                res.end(JSON.stringify(room));
                            });
                    });

                    that._server.listen(that._port, that._host);
                    logger.debug("HTTPinterface: Listening at https://" + that._host + ":" + that._port);
                    resolve();
                });
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