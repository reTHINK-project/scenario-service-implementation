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

var debugMode = false;

var app = angular.module('hotelGuestGUI', []);
app.controller('hotelGuestController', ($scope) => {
    $scope.cc = window.colorConversion;

    var thumbnailUrl;
    if (debugMode) {
        thumbnailUrl = "img/hotel-thumbnail.jpg";
    }
    else {
        thumbnailUrl = "https://hotel-guest-rethink.fokus.fraunhofer.de/cam"; //url of webcam feed for hue bulb
    }
    var hotel = {
        thumbnailUrl: thumbnailUrl,
        name: "MyHotel",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam finibus neque ut dolor pharetra tempus. Ut eget turpis faucibus, tincidunt ante id, auctor elit.",
        rooms: []
    };
    $scope.hotel = hotel;

    $scope.adminMode = false;
    $scope.fail = [];

    var roomClient;

    $scope.calculateBackgroundColor = (hex) => {
        var rgb = hexToRgb(hex);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", .5)";
    };

    //Iterate over all lights of room and convert color values to hex
    $scope.convertColorValues = (room) => {
        for (var device in room.devices) {

            var lights = room.devices[device].lastValues.light;

            for (var a in lights) {
                if (lights[a].color.unit === "CIE_JSON") {
                    lights[a].color.value = rgbToHex_s(cieToRGB_s(lights[a].color.value));
                    lights[a].color.unit = "RGB_HEX";
                    console.log("converted single color value:", lights[a].color.value);
                }
            }
        }
    };

    var satMap = {};
    $scope.sendAction = (deviceName, objectType, objectId, resourceType, value) => {
        console.debug("sendAction", deviceName, objectType, resourceType, value);
        return new Promise((resolve, reject) => {
            if (!roomClient) {
                var errorMsg = "sendAction(): roomClient hyperty not loaded! Can't perform action."
                console.error(errorMsg);
                $scope.fail.push(errorMsg);
                reject(errorMsg);
            }
            else {
                var key = [deviceName, objectId, resourceType];
                var sat = satMap[key];
                if (sat) {
                    clearTimeout(sat);
                }
                if (objectType === "light" && resourceType === "color.value") { //Conversion needed
                    value = rgbToCIE_s(hexToRgb(value));
                }
                sat = setTimeout(() => {
                    roomClient.sendAction(deviceName, objectType, objectId, resourceType, value).then((result) => {
                        console.debug("sendAction(): Action sent", result);
                        resolve(result);
                    })
                }, 100);
                satMap[key] = sat;
            }
        })
    };

    $scope.getDoorLock = (room) => {
        console.debug("getDoorLock(" + room + ")");
        for (var device in room.devices) {

            var actuators = room.devices[device].lastValues.actuator;

            for (var a in actuators) {
                if (actuators[a].applicationType === "doorLock" && actuators[a].name === "Door") {
                    console.debug("getDoorLock(): Found door lock", actuators[a]);
                    return actuators[a];
                }
            }
        }
    };


    $scope.toggleDoorLock = (doorLock, room) => {
        console.debug("toggleDoorLock:", doorLock, room);

        var rooms = $scope.hotel.rooms;
        if (room)
            rooms = [room];

        for (var r in rooms) {
            r = rooms[r];

            for (var device in r.devices) {

                var actuators = r.devices[device].lastValues.actuator;

                for (var a in actuators) {
                    if (doorLock === undefined || actuators[a] === doorLock) {
                        console.debug("toggleDoorLock(): Found device", r.devices[device]);
                        $scope.sendAction(r.devices[device].name, "actuator", doorLock.id, "isOn", doorLock.isOn).then((result) => {
                            console.debug("sendAction(): Action sent", result);
                        })

                    }
                }
            }
        }


    };

    $scope.toggleGlobalState = (type, state) => {

        if (type !== "doorLock" && type !== "light") {
            console.error("Invalid type");
        }
        else {
            var tasks = [];
            hotel.rooms.forEach((room) => {
                room.devices.forEach((device) => {
                    if (type === "light") {
                        device.lastValues.light.forEach((light) => {
                            tasks.push(roomClient.sendAction(device.name, type, light.id, "isOn", state)); //Send from roomClient directly to skip timeout
                        })
                    }
                    else if (type === "doorLock") {
                        device.lastValues.actuator.forEach((actuator) => {
                            if (actuator.applicationType === type) {
                                tasks.push(roomClient.sendAction(device.name, "actuator", actuator.id, "isOn", state)); //Send from roomClient directly to skip timeout
                            }
                        })
                    }
                })
            });
            Promise.all(tasks)
                .then((result) => {
                    console.debug("Set " + type + " state for all lights to", state);
                    console.debug("Result:", result);
                })
        }

    };

    this.roomInit = (room) => {
        room.mainLock = $scope.getDoorLock(room); //Init main locks
        $scope.convertColorValues(room); //Convert room light colors
    };

    this.roomHandlerNew = (room) => {
        console.debug("Room received", room);
        hotel.rooms.push(room);
        hotel.rooms.forEach((r) => {
            this.roomInit(r);
        });
        $scope.$applyAsync();
    };

    this.roomHandlerChanged = (room) => {
        console.debug("Room updated", room);
        for (var i = 0; i < hotel.rooms.length; i++) {
            if (hotel.rooms[i].name === room.name) {
                hotel.rooms[i] = room;
                this.roomInit(room);
                console.debug("Converted color values for room", room);
                break;
            }
        }
        $scope.$applyAsync();
    };

    this.errorHandler = (error) => {
        console.error("Error in roomClient", error);
        if (typeof error !== "undefined") {
            $scope.fail.push(error.message);
        }
        $scope.$applyAsync();
    };


    this.userStateChangeHandler = (isAdmin) => {
        console.debug("userStateChange", isAdmin);
        $scope.adminMode = isAdmin;
        $scope.$applyAsync();
    };


    var token = getURLParameter("token");
    console.debug("URL value for 'token':", token);
    if (token === null) {
        var errorMsg = "Invalid identity token! Must not be empty! [Test tokens: Admin: 'token=admintoken', User: 'token=usertoken']";
        console.error(errorMsg);
        $scope.fail.push(errorMsg);
        return;
    }

    if (debugMode) {
        this.roomHandlerNew(
            {
                "_id": "5850288ae8bffa3b11573439",
                "isBooked": false,
                "name": "237",
                "__v": 1,
                "members": [],
                "devices": [
                    {
                        "_id": "5850288be8bffa3b1157343b",
                        "name": "myRaspberry",
                        "__v": 0,
                        "room": "5850288ae8bffa3b11573439",
                        "lastValues": {
                            "misc": [],
                            "actuator": [{
                                "applicationType": "doorLock",
                                "isOn": true,
                                "timestamp": "2016-12-06T12:40:32.315Z",
                                "_id": "5846b1c03ed04866771e7601",
                                "name": "Door",
                                "id": 0
                            }],
                            "light": [{
                                "name": "Desklamp",
                                "id": 1,
                                "_id": "5825a62608d25170004c5982",
                                "isOn": true,
                                "dimmer": 97,
                                "timestamp": "2016-12-02T12:04:51.783Z",
                                "color": {"unit": "CIE_JSON", "value": [0.409, 0.518]}
                            },
                                {
                                    "name": "Bedroom",
                                    "id": 1,
                                    "_id": "5825a62608d25170004c5982",
                                    "isOn": true,
                                    "dimmer": 60,
                                    "timestamp": "2016-12-02T12:04:51.783Z",
                                    "color": {"unit": "CIE_JSON", "value": [0.3333, 0.3333]}
                                },
                                {
                                    "name": "Bathroom",
                                    "id": 1,
                                    "_id": "5825a62608d25170004c5982",
                                    "isOn": false,
                                    "dimmer": 100,
                                    "timestamp": "2016-12-02T12:04:51.783Z",
                                    "color": {"unit": "CIE_JSON", "value": [0.3333, 0.3333]}
                                }],
                            "humidity": [{
                                "unit": "%",
                                "id": 0,
                                "_id": "5825a62608d25170004c5981",
                                "value": 57.6,
                                "timestamp": "2016-12-02T12:10:29.863Z"
                            }],
                            "temperature": [{
                                "unit": "Cel",
                                "id": 0,
                                "_id": "5825a62608d25170004c5981",
                                "value": 22.1,
                                "timestamp": "2016-12-02T12:10:29.863Z"
                            }, {

                                "unit": "Cel",
                                "id": 1,
                                "_id": "5825a62608d25170004c5981",
                                "value": 20.4,
                                "timestamp": "2016-12-02T12:10:29.863Z"
                            }]
                        },
                        "registration": {
                            "timestamp": "2016-12-13T16:57:47.096Z",
                            "registered": true
                        }
                    }
                ],
                "wifi": {
                    "ssid": "237wifi",
                    "user": "237user",
                    "password": "237password"
                },
                "$$hashKey": "object:7"
            }
        );
    }
    else {
        window.rethink.default.install({domain: 'fokus.fraunhofer.de', development: false}).then((runtime) => {
            runtime.requireHyperty("hyperty-catalogue://catalogue.fokus.fraunhofer.de/.well-known/hyperty/RoomClient").then((hyperty) => {
                roomClient = hyperty.instance;
                window.roomClient = roomClient;

                roomClient.addEventListener('newRoom', this.roomHandlerNew);
                roomClient.addEventListener('changedRoom', this.roomHandlerChanged);
                roomClient.addEventListener('error', this.errorHandler);
                roomClient.addEventListener('userStateChange', this.userStateChangeHandler);

                roomClient.start(token);
            })
        }).catch(this.errorHandler);
    }
});

//From: https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
