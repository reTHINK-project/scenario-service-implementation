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
import util from "./Util";
import mapping from "./lwm2m-mapping";


class TempSensor {

    constructor(client, refreshInterval = 5000) {
        this._client = client;
        this._refreshInterval = refreshInterval;
        this._objectTypeId = mapping.getAttrId("temperature").objectTypeId;
    }

    get sensors() {
        return this._sensors;
    }

    start() {
        var that = this;
        return new Promise((resolve, reject) => {
            if (!that._client || typeof that._client === "undefined") {
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
                            util.createClientObject(that._client, "/" + that._objectTypeId + "/" + index)
                                .catch(reject)
                                .then(() => {
                                    return util.setClientResource(
                                        that._client,
                                        "/" + that._objectTypeId + "/" + index,
                                        mapping.getAttrId("temperature", "unit").resourceTypeId,
                                        "Cel"); //Set temperature object unit
                                })
                                .catch((error) => {
                                    if (error) {
                                        errors.push(error);
                                    }
                                })
                                .then((result) => {
                                    logger.debug("Set unit", result);
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
        var index = 0;
        var errors = [];
        var resourceTypeId = mapping.getAttrId("temperature", "value").resourceTypeId;

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
                        util.setClientResource(that._client, "/" + that._objectTypeId + "/" + index, resourceTypeId, value)
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
}

export default TempSensor;