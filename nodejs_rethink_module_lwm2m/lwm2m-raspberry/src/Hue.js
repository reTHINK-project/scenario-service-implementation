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

//TODO: remove hard-coded ipso-ids, query with them mapping-object by name

import HueControl from "philips-hue";
import logger from "logops";
import async from "async";
import util from "./Util";
import mapping from "./lwm2m-mapping";

class Hue {
    constructor(lwm2m, bridge, username) {
        this._lwm2m = lwm2m;
        this._hue = new HueControl();
        this._hue.bridge = bridge;
        this._hue.username = username;
    }

    start() { //Get all lights and create lwm2m-objects
        var that = this;
        return new Promise((resolve, reject) => {
            var lights = null;

            this._hue.getLights()
                .catch(reject)
                .then((result) => {
                    lights = result;
                    return that._initObjects(lights);
                })
                .catch(reject)
                .then(() => {
                    resolve(lights)
                })
        });
    }

    _initObjects(lights) {
        var that = this;
        return new Promise((resolve, reject) => {
            var errors = [];

            async.each(Object.keys(lights), (id, callback) => {

                //Create lwm2m-client object to store lamp-data (Object/Resources according to IPSO Standard)
                util.createClientObject(that._lwm2m, "/3311/" + id)
                    .catch((error) => {
                        if (error) {
                            errors.push(error);
                        }
                    })
                    .then(() => {
                        var obj = "/3311/" + id;
                        var state = lights[id].state;
                        var setVal = [];
                        logger.debug("Hue: Created lwm2m-object for light '" + id + "' '/3311/" + id + "'");

                        //Get initial light info and set resources

                        //Name (Not IPSO compliant. IPSO does not provide field for descriptor)
                        if (lights[id].hasOwnProperty("name")) {
                            setVal.push(util.setClientResource(that._lwm2m, obj, 5801, lights[id].name));
                        }

                        //On/off state
                        setVal.push(util.setClientResource(that._lwm2m, obj, 5850, state.on ? "true" : "false"));

                        //Brightness / Dimmer
                        setVal.push(util.setClientResource(that._lwm2m, obj, 5851, util.convertRangeRound(state.bri, [1, 254], [1, 100])));

                        //Color
                        //Only set color if bulb supports it //TODO: Verify check
                        if (state.xy) {
                            setVal.push(util.setClientResource(that._lwm2m, obj, 5706, JSON.stringify(state.xy))); //CIE-coords in json format
                            setVal.push(util.setClientResource(that._lwm2m, obj, 5701, "CIE_JSON")); //TODO: might have to wrap in {} for valid JSON
                            //Philips-hue uses coordinates in C.I.E for colors: http://www.developers.meethue.com/documentation/core-concepts
                        }

                        Promise.all(setVal) //TODO: replace with different structure, don't cancel on first reject
                            .catch((error) => {
                                errors.push(error);
                                callback();
                            })
                            .then((results) => {
                                logger.debug("Hue Set initial light-info: light '" + id + "'", results);
                                callback();
                            });
                    });
            }, () => {
                if (errors.length > 0) {
                    reject(errors);
                }
                else {
                    resolve(); //Resolve when all objects have been created (for-each is done)
                }
            });
        });
    }

    stop() {

    }

    handleWrite(objectType, objectId, resourceId, value) {
        var that = this;
        return new Promise((resolve, reject) => {
            if (objectType !== "3311") {
                reject(new Error("Invalid objectType for hue!"));
            }
            else {
                var attr = mapping.getAttrName(objectType, resourceId);
                if (attr == null) {
                    reject(new Error("Unknown operation for resourceId " + resourceId + ", objectType " + objectType));
                }
                else {
                    switch (attr.resourceType) {
                        case "name":
                            that._hue.light(objectId).setInfo({"name": value})
                                .catch(reject)
                                .then(resolve);
                            break;
                        case "isOn":
                            that._setOnState(objectId, value)
                                .catch(reject)
                                .then(resolve);
                            break;
                        case "dimmer": //range: 1-100
                            if (value >= 1 && value <= 100) {
                                var briState = {};
                                briState.bri = util.convertRangeRound(value, [1, 100], [1, 254]);
                                that._hue.light(objectId).setState(briState)
                                    .catch(reject)
                                    .then(() => {
                                        logger.debug("Hue: Light " + objectId + ": BRI", briState);
                                        resolve();
                                    });
                            }
                            else {
                                reject(new Error("Invalid value-range for brightness. Expected 1-100"));
                            }
                            break;
                        case "color.value":
                            var colorCoord = JSON.parse(value);
                            if (!(colorCoord.hasOwnProperty("length")) || !(colorCoord.length === 2)) { //Test if array [x,y]
                                reject(new Error("Invalid coordinate-array! Expected [x,y]"));
                            }
                            var colorState = {};
                            colorState.xy = colorCoord;

                            that._hue.light(objectId).setState(colorState)
                                .catch(reject)
                                .then(() => {
                                    logger.debug("Hue: Light " + objectId + ": XY", colorState); //FIXME: Also runs on catch
                                    resolve();
                                });
                            break;
                        case "color.unit": //Unit for color-value
                            reject(new Error("Resource Unit is read only!"));
                            break;
                        case "onTime": //R,W
                        case "cumulativeActivePower": //R
                        case "powerFactor": //R
                            reject(new Error("Resource not supported!"));
                            break;
                    }
                }
            }
        });
    }

    _setOnState(id, state) {
        var that = this;
        return new Promise((resolve, reject) => {
            var done;
            if (state == true) {
                done = that._hue.light(id).on();
            }
            else {
                done = that._hue.light(id).off();
            }
            done
                .catch(reject)
                .then(() => {
                    logger.debug("Hue: Light " + id + " on: " + state);
                    resolve();
                });
        });
    }

    get ctl() {
        return this._hue;
    }
}

export default Hue;