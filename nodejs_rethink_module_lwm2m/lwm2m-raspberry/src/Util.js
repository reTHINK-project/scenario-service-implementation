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

var util = {};

//Methods wrapped in promises

util.createClientObject = function (client, objectUri) {
    return new Promise((resolve, reject) => {
        if (typeof client === "undefined" || typeof objectUri === "undefined") {
            reject(new Error("util.createClientObject: Invalid parameters!"));
        }
        else {
            client.registry.create(objectUri, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            })
        }
    });
};

util.setClientResource = function (client, objectUri, resourceId, value) {
    return new Promise((resolve, reject) => {
        if (typeof client === "undefined" || typeof objectUri === "undefined" || typeof resourceId === "undefined" || typeof value === "undefined") {
            reject(new Error("util.setClientResource: Invalid parameters!"));
        }
        else {
            client.registry.setResource(objectUri, resourceId, value, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        }
    });
};

util.convertRangeRound = function (value, r1, r2) {
    return Math.round(util.convertRange(value, r1, r2));
};

util.convertRange = function (value, r1, r2) {
    return ( value - r1[0] ) * ( r2[1] - r2[0] ) / ( r1[1] - r1[0] ) + r2[0];
};

export default util;