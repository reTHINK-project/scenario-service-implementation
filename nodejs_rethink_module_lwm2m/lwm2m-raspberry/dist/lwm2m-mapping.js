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

Object.defineProperty(exports, "__esModule", {
    value: true
});
var mapping = {};

var map = [{
    "objectTypeId": 3303,
    "objectType": "temperature",
    "resources": [{
        "resourceTypeId": 5700,
        "resourceType": "value",
        "readOnly": true
    }, {
        "resourceTypeId": 5701,
        "resourceType": "unit",
        "readOnly": true
    }]
}, {
    "objectTypeId": 3304,
    "objectType": "humidity",
    "resources": [{
        "resourceTypeId": 5700,
        "resourceType": "value",
        "readOnly": true
    }, {
        "resourceTypeId": 5701,
        "resourceType": "unit",
        "readOnly": true
    }]
}, {
    "objectTypeId": 3306,
    "objectType": "actuator",
    "resources": [{
        "resourceTypeId": 5801,
        "resourceType": "name",
        "readOnly": false
    }, {
        "resourceTypeId": 5850,
        "resourceType": "isOn",
        "readOnly": false
    }, {
        "resourceTypeId": 5750,
        "resourceType": "applicationType",
        "readOnly": true
    }]
}, {
    "objectTypeId": 3311,
    "objectType": "light",
    "resources": [{
        "resourceTypeId": 5801,
        "resourceType": "name",
        "readOnly": false
    }, {
        "resourceTypeId": 5850,
        "resourceType": "isOn",
        "readOnly": false
    }, {
        "resourceTypeId": 5851,
        "resourceType": "dimmer",
        "readOnly": false
    }, {
        "resourceTypeId": 5706,
        "resourceType": "color.value",
        "readOnly": false
    }, {
        "resourceTypeId": 5701,
        "resourceType": "color.unit",
        "readOnly": true
    }, {
        "resourceTypeId": 5852,
        "resourceType": "onTime",
        "readOnly": true
    }, {
        "resourceTypeId": 5805,
        "resourceType": "cumulativeActivePower",
        "readOnly": true
    }, {
        "resourceTypeId": 5820,
        "resourceType": "powerFactor",
        "readOnly": true
    }]
}];

/*
 * If no resourceTypeId is provided, only objectType is returned
 */
mapping.getAttrName = function (objectTypeId, resourceTypeId) {
    var objectType, resourceType;
    for (var i = 0; i < map.length; i++) {
        if (map[i].objectTypeId == objectTypeId) {
            objectType = map[i].objectType;
            //If only objectType is set
            if (resourceTypeId === null || typeof resourceTypeId === "undefined") {
                return {
                    "objectType": objectType
                };
            }
            for (var j = 0; j < map[i].resources.length; j++) {
                if (map[i].resources[j].resourceTypeId == resourceTypeId) {
                    resourceType = map[i].resources[j].resourceType;
                    return {
                        "resourceType": resourceType,
                        "objectType": objectType,
                        "readOnly": map[i].resources[j].readOnly
                    };
                }
            }
        }
    }
    //Not found
    return null;
};

/*
 * If no resourceType is provided, only objectTypeId is returned
 */
mapping.getAttrId = function (objectType, resourceType) {
    var objectTypeId, resourceTypeId;

    for (var i = 0; i < map.length; i++) {
        if (map[i].objectType == objectType) {
            objectTypeId = map[i].objectTypeId;
            //If only objectType is set
            if (resourceType === null || typeof resourceType === "undefined") {
                return {
                    "objectTypeId": objectTypeId
                };
            }
            for (var j = 0; j < map[i].resources.length; j++) {
                if (map[i].resources[j].resourceType == resourceType) {
                    resourceTypeId = map[i].resources[j].resourceTypeId;
                    return {
                        "resourceTypeId": resourceTypeId,
                        "objectTypeId": objectTypeId,
                        "readOnly": map[i].resources[j].readOnly
                    };
                }
            }
        }
    }
    //Not found
    return null;
};

exports.default = mapping;
//# sourceMappingURL=lwm2m-mapping.js.map