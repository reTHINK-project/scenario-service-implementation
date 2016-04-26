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
                    return that._createObjects(lights);
                })
                .catch(reject)
                .then(() => {
                    resolve(lights)
                })
        });
    }

    _createObjects(lights) {
        var that = this;
        return new Promise((resolve, reject) => {
            var errors = [];

            async.each(Object.keys(lights), (id, callback) => {
                that._lwm2m.registry.create("/3311/" + id, (error) => {
                    if (error) {
                        errors.push(error);
                    }
                    else {
                        logger.debug("Hue: Created lwm2m-object for light '" + id + "' '/3311/" + id + "'");
                    }
                    callback();
                })
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
            if (objectType != "3311") {
                reject(new Error("Invalid objectType for hue!"));
            }
            else {
                switch (resourceId) {
                    case "5850": //On/off
                        if (value == true) {
                            that._hue.light(objectId).on()
                                .catch(reject)
                                .then(resolve);
                        }
                        else {
                            that._hue.light(objectId).off()
                                .catch(reject)
                                .then(resolve);
                        }
                        break;
                    case "5851": //Dimmer (0-100)
                        reject(new Error("Dimmer-control not yet supported"));
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

    get ctl() {
        return this._hue;
    }
}

export default Hue;