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
        thumbnailUrl = "/cam"; //url of webcam feed for hue bulb
    }
    var hotel = {
        thumbnailUrl: thumbnailUrl,
        name: "MyHotel",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam finibus neque ut dolor pharetra tempus. Ut eget turpis faucibus, tincidunt ante id, auctor elit.",
        rooms: []
    };
    $scope.hotel = hotel;

    $scope.adminMode = true;
    $scope.fail = [];

    var roomClient;

    $scope.calculateBackgroundColor = (cie) => {
        var rgb = cieToRGB_s(cie);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", .5)";
    };

    //FIXME
    $scope.updateColorPicker = (cie) => {
        console.debug("Updating color picker", cie);
        var ret = rgbToHex_s(cieToRGB_s(cie));
        $scope.lightColor = ret; //FIXME
        console.debug("Converted", ret);
    };

    var satMap = {};
    $scope.sendAction = (deviceName, objectType, objectId, resourceType, value) => {
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
                sat = setTimeout(() => {
                    if (objectType === "light" && resourceType === "color.value") { //Conversion needed
                        value = rgbToCIE_s(hexToRgb(value));
                    }
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
        for (var device in room.values) {

            var actuators = room.values[device].value.lastValues.actuator;

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
            for (var device in r.values) {

                var actuators = r.values[device].value.lastValues.actuator;

                for (var a in actuators) {
                    if (doorLock === undefined || actuators[a] === doorLock) {
                        console.debug("toggleDoorLock(): Found device", r.values[device]);
                        $scope.sendAction(r.values[device].name, "actuator", doorLock.id, "isOn", doorLock.isOn).then((result) => {
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
                room.values.forEach((device) => {
                    if (type === "light") {
                        device.value.lastValues.light.forEach((light) => {
                            tasks.push(roomClient.sendAction(device.name, type, light.id, "isOn", state)); //Send from roomClient directly to skip timeout
                        })
                    }
                    else if (type === "doorLock") {
                        device.value.lastValues.actuator.forEach((actuator) => {
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

    var token = getURLParameter("token");
    console.debug("URL value for 'token':", token);
    if (token === null) {
        var errorMsg = "Invalid identity token! Must not be empty! [Test tokens: Admin: 'token=admintoken', User: 'token=usertoken']";
        console.error(errorMsg);
        $scope.fail.push(errorMsg);
        return;
    }

    if (debugMode) {
        //Define dummy room
        hotel.rooms.push(
            {
                "id": "5825a61908d25170004c597d",
                "name": "room1",
                "values": [{
                    "name": "myRaspberry",
                    "value": {
                        "_id": "5825a61908d25170004c5980",
                        "name": "myRaspberry",
                        "__v": 99,
                        "room": "5825a61908d25170004c597d",
                        "lastValues": {
                            "misc": [],
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
                            "humidity": [],
                            "actuator": [
                                {
                                    "applicationType": "doorLock",
                                    "isOn": true,
                                    "timestamp": "2016-12-06T12:40:32.315Z",
                                    "_id": "5846b1c03ed04866771e7601",
                                    "name": "Door",
                                    "id": 0
                                }
                            ],
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
                            "payload": "</3311/1>,</3303/0>",
                            "timestamp": "2016-12-02T12:04:48.839Z",
                            "registered": true
                        }
                    }
                }],
                "scheme": "context",
                "type": "chat",
                "reporter": "hyperty://fokus.fraunhofer.de/5c9039f9-53be-40e9-815a-740879a5d837",
                "schema": "hyperty-catalogue://catalogue.fokus.fraunhofer.de/.well-known/dataschema/Context"
            }
        )
    }
    else {
        window.rethink.default.install({domain: 'fokus.fraunhofer.de', development: false}).then((runtime) => {
            runtime.requireHyperty("hyperty-catalogue://catalogue.fokus.fraunhofer.de/.well-known/hyperty/RoomClient").then((hyperty) => {
                roomClient = hyperty.instance;
                window.roomClient = roomClient;

                roomClient.addEventListener('newRoom', (room) => {
                    console.debug("Room received", room);
                    hotel.rooms.push(room);
                    $scope.$apply();
                    console.debug(JSON.stringify(hotel.rooms, null, 2));
                    hotel.rooms.forEach((r) => {
                        r.mainLock = $scope.getDoorLock(room); //Init main locks
                    })
                });

                roomClient.addEventListener('changedRoom', (room) => {
                    console.debug("Room updated", room);
                    for (var i = 0; i < hotel.rooms.length; i++) {
                        if (hotel.rooms[i].name === room.name) {
                            hotel.rooms[i] = room;
                            room.mainLock = $scope.getDoorLock(room); //Init main lock
                            break;
                        }
                    }
                    $scope.$apply();
                });

                roomClient.addEventListener('error', (error) => {
                    console.error("Error in roomClient", error);
                    if (typeof error !== "undefined") {
                        $scope.fail.push(error.message);
                    }
                    $scope.$apply();
                });

                roomClient.start(token);
            })
        }).catch((error) => {
            console.error(error);
            $scope.fail.push(error);
        });
    }
});

//From: https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
