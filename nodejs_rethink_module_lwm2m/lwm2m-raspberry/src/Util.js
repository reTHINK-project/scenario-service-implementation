/**
 * Created by pbz on 27.04.16.
 */
'use strict';

var util = {};

util.setClientResource = function (client, objectUri, resourceId, value) {
    return new Promise((resolve, reject) => {
        client.registry.setResource(objectUri, resourceId, value, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
};

export default util;