/**
 * Created by pbz on 27.04.16.
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

export default util;