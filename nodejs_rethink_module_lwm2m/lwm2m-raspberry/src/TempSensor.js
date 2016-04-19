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
import ds18b20 from "ds18b20";
import logger from "logops";
import async from "async";


class TempSensor {

    constructor(client, refreshInterval = 5000) {
        this._client = client;
        this._refreshInterval = refreshInterval;
    }

    get sensors() {
        return this._sensors;
    }

    start() {
        var that = this;
        return new Promise((resolve, reject) => {
            if (!that._client || typeof that._client === "undefined") { //TODO: Check if client is initialised
                reject(new Error("lwm2m-client object not set"));
            }
            else {
                //Get sensors
                ds18b20.sensors((error, ids) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        if (typeof ids === "undefined" || ids.length === 0) {
                            reject(new Error("No temperature sensor/s found!"));
                        }

                        logger.debug("Found sensor/s!", ids);
                        this._sensors = ids;

                        //For each sensor, create client object for lwm2m
                        var index = 0;
                        var errors = [];
                        async.each(ids, (id, callback) => {
                            that._client.registry.create("/3303/" + index, (error) => {
                                if (error) {
                                    errors.push(error);
                                }
                                index++;
                                callback();
                            });
                        }, () => { //When all sensor-objects have been created

                            //Initial temperature-read
                            that._setClientTemp(that);
                            //Start timer for updating sensor-object with temperature-values
                            that._timer = setInterval(that._setClientTemp, that._refreshInterval, that);


                            if (errors.length > 0) {
                                reject(errors);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                })
            }
        });
    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }

    _setClientTemp(that) {
        //1. Query values
        //2. Set values (according to ipso spec)
        
        var index = 0;
        var errors = [];

        async.each(that._sensors, (id, callback) => {
            ds18b20.temperature(id, (error, value) => {
                if (error) {
                    logger.error(error);
                    errors.push(error);
                }
                else {
                    logger.debug("Sensor '" + id + "': " + value);
                    logger.debug("Setting values in lwm2m-client");

                    Promise.all([
                            that._setClientResource("/3303/" + index, 5700, value), //Temperature value
                            that._setClientResource("/3303/" + index, 5701, "Cel") //Temperature unit
                        ])
                        .then((results) => {
                            logger.debug("Set values", results);
                            index++;
                            callback();
                        }, (error) => {
                            if (error) {
                                errors.push(error);
                            }
                            index++;
                            callback();
                        });
                }
            });
        }, () => {
            if (errors.length > 0) {
                logger.error("Error/s while storing temperature!", errors);
            }
        });
    }

    _setClientResource(objectUri, resourceId, value) {
        var that = this;
        return new Promise((resolve, reject) => {
            that._client.registry.setResource(objectUri, resourceId, value, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}

export default TempSensor;