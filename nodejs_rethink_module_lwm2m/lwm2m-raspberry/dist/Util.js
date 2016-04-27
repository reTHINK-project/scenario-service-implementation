/**
 * Created by pbz on 27.04.16.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var util = {};

//Methods wrapped in promises

util.createClientObject = function (client, objectUri) {
    return new Promise(function (resolve, reject) {
        if (typeof client === "undefined" || typeof objectUri === "undefined") {
            reject(new Error("util.createClientObject: Invalid parameters!"));
        } else {
            client.registry.create(objectUri, function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        }
    });
};

util.setClientResource = function (client, objectUri, resourceId, value) {
    return new Promise(function (resolve, reject) {
        if (typeof client === "undefined" || typeof objectUri === "undefined" || typeof resourceId === "undefined" || typeof value === "undefined") {
            reject(new Error("util.setClientResource: Invalid parameters!"));
        } else {
            client.registry.setResource(objectUri, resourceId, value, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }
    });
};

//TODO: Range-convert not accurate enough yet. E.g.: 100 has to map to 254!
util.convertRangeRound = function (value, r1, r2) {
    return Math.round(util.convertRange(value, r1, r2));
};

util.convertRange = function (value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
};

exports.default = util;
//# sourceMappingURL=Util.js.map