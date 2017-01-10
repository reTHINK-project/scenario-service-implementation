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

import util from "./Util";
import mapping from "./lwm2m-mapping";
import logger from "logops";

class DoorLock {
    constructor(lwm2m) {
        this._lwm2m = lwm2m;
    }

    start() { //Create lwm2m-object/s //TODO support multiple door locks
        var that = this;
        return new Promise((resolve, reject) => {
            var obj = "/" + mapping.getAttrId("actuator").objectTypeId + "/" + 0;

            util.createClientObject(that._lwm2m, obj)
                .catch((error) => {
                    reject(error);
                })
                .then(() => { //FIXME: cascading promises :(
                    util.setClientResource(that._lwm2m, obj, mapping.getAttrId("actuator", "isOn").resourceTypeId,
                        "false") //Default locked, todo: configurable
                        .catch((error) => {
                            reject(error);
                        })
                        .then(() => {
                            util.setClientResource(that._lwm2m, obj, mapping.getAttrId("actuator", "name").resourceTypeId,
                                "Door") //Default name, todo: configurable
                                .catch((error) => {
                                    reject(error);
                                })
                                .then(() => {
                                    util.setClientResource(that._lwm2m, obj, mapping.getAttrId("actuator", "applicationType").resourceTypeId,
                                        "doorLock")
                                        .catch((error) => {
                                            reject(error);
                                        })
                                        .then(() => {
                                            resolve();
                                        })
                                })
                        })
                })
        });
    }


    stop() {

    }

    handleWrite(objectType, objectId, resourceId, value) {
        var that = this;
        return new Promise((resolve, reject) => {
            logger.debug("DoorLock handleWrite:", objectType, objectId, resourceId, value);
            if (objectType != mapping.getAttrId("actuator").objectTypeId) {
                reject(new Error("Invalid objectType for DoorLock!"));
            }
            else {
                var attr = mapping.getAttrName(objectType, resourceId);
                if (attr == null) {
                    reject(new Error("Unknown operation for resourceId " + resourceId + ", objectType " + objectType));
                }
                else {
                    //No actions needed => Virtual actuator =>  data is handled by lwm2m client object
                    resolve();
                }
            }
        });
    }

}

export default DoorLock