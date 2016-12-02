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

var debugMode = true;

var app = angular.module('hotelGuestGUI', []);
app.controller('hotelGuestController', ($scope) => {
    $scope.cc = window.colorConversion;

    var hotel = {
        thumbnailUrl: "img/hotel-thumbnail.jpg",
        name: "MyHotel",
        description: "The best Hotel in the world!",
        rooms: []
    };
    $scope.hotel = hotel;
    window.hotel = hotel;

    $scope.fail = [];

    var roomClient;

    $scope.calculateBackgroundColor = (cie) => {
        var rgb = cieToRGB_s(cie);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", .5)";
    };

    $scope.updateColorPicker = (cie) => {
        console.debug("Updating color picker", cie);
        var ret = rgbToHex_s(cieToRGB_s(cie));
        $scope.lightColor = ret;
        console.debug("Converted", ret);
    };

    var satMap = {};
    $scope.sendAction = (deviceName, objectId, resourceType, value) => {
        if (!roomClient) {
            var errorMsg = "sendAction(): roomClient hyperty not loaded! Can't perform action."
            console.error(errorMsg);
            $scope.fail.push(errorMsg);
        }
        else {
            var key = [deviceName, objectId, resourceType];
            var sat = satMap[key];
            if (sat) {
                clearTimeout(sat);
            }

            sat = setTimeout(() => {
                if (resourceType === "color.value") {
                    value = rgbToCIE_s(hexToRgb(value));
                }
                roomClient.sendAction(deviceName, "light", objectId, resourceType, value).then((result) => {
                    console.debug("sendAction(): Action sent", result);
                })
            }, 100);

            satMap[key] = sat;

        }
    };

    $scope.toggleDoorLock = (roomName) => {
        console.debug("toggleDoorLock(" + roomName + ")");
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
                            }],
                            "humidity": [],
                            "temperature": [{
                                "unit": "Cel",
                                "id": 0,
                                "_id": "5825a62608d25170004c5981",
                                "value": 22.1,
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
                });

                roomClient.addEventListener('changedRoom', (room) => {
                    console.debug("Room updated", room);
                    for (var i = 0; i < hotel.rooms.length; i++) {
                        if (hotel.rooms[i].name === room.name) {
                            hotel.rooms[i] = room;
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
