/**
 * Created by pbz on 27.04.16.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var util = {};

util.setClientResource = function (client, objectUri, resourceId, value) {
    return new Promise(function (resolve, reject) {
        client.registry.setResource(objectUri, resourceId, value, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

exports.default = util;
//# sourceMappingURL=Util.js.map