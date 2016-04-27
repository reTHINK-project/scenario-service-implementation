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

import HueControl from "philips-hue";
import logger from "logops";
import async from "async";
import util from './Util';

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
                        setVal.push(util.setClientResource(that._lwm2m, obj, 5850, state.on ? 1 : 0));
                        setVal.push(util.setClientResource(that._lwm2m, obj, 5851, util.convertRangeRound(state.bri, [1, 254], [1, 100])));
                        //TODO: setVal.push() for color...

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
                    resolve();
                }
            }); //Resolve when all objects have been created
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
                switch (resourceId) {
                    case "5850": //On/off
                        that._setOnState(objectId, value)
                            .catch(reject)
                            .then(resolve);
                        break;
                    case "5851": //Dimmer (1-100) //TODO: Support 0 as minimum. This should turn off the bulb?!
                        if (value >= 1 && value <= 100) {
                            var state = {};
                            state.bri = util.convertRangeRound(value, [1, 100], [1, 254]);
                            that._hue.light(objectId).setState(state)
                                .catch(reject)
                                .then(() => {
                                    logger.debug("Hue: Light " + objectId + ": BRI", state);
                                    resolve();
                                });
                        }
                        else {
                            reject(new Error("Invalid value-range for brightness. Expected 1-100"));
                        }
                        break;
                    case "5706": //Colour
                        reject(new Error("Colour-control not yet supported"));
                        break;
                    default:
                        reject(new Error("Unknown operation for resourceId " + resourceId));
                        break;
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