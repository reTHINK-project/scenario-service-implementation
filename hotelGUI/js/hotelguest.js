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

    $scope.failed = false;
    $scope.failMsg = "Unknown error. Check the console for details";

    var roomClient;

    $scope.calculateBackgroundColor = (cie) => {
        var rgb = cieToRGB_s(cie);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", .5)";
    };

    $scope.updateColorPicker = (cie) => {
        console.warn("Updating color picker", cie);
        var ret = rgbToHex_s(cieToRGB_s(cie));
        console.warn("Converted", ret);
        return ret;
    };

    var satMap = {};
    $scope.sendAction = (deviceName, objectId, resourceType, value) => {
        if (!roomClient) {
            console.error("sendAction(): roomClient hyperty not loaded! Can't perform action.");
            alert("Error while sending action! Client Hyperty not ready!");
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
                    console.log("sendAction(): Action sent", result);
                })
            }, 100);

            satMap[key] = sat;

        }
    };

    var token = getURLParameter("token");
    console.debug("URL value for 'token':", token);
    if (token === null) {
        var errorMsg = "Invalid identity token! Must not be empty! [Test tokens: Admin: 'token=admintoken', User: 'token=usertoken']";
        console.error(errorMsg);
        $scope.failed = true;
        $scope.failMsg = errorMsg;

        return;
    }

    window.rethink.default.install({domain: 'fokus.fraunhofer.de', development: false}).then((runtime) => {
        runtime.requireHyperty("hyperty-catalogue://catalogue.fokus.fraunhofer.de/.well-known/hyperty/RoomClient").then((hyperty) => {
            roomClient = hyperty.instance;
            window.roomClient = roomClient;

            roomClient.addEventListener('newRoom', (room) => {
                console.log("Room received", room);
                hotel.rooms.push(room);
                $scope.$apply();
                console.log(JSON.stringify(hotel.rooms, null, 2));
            });

            roomClient.addEventListener('changedRoom', (room) => {
                console.log("Room updated", room);
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
                $scope.failed = true;
                if (typeof error !== "undefined") {
                    $scope.failMsg = error.message;
                }
                $scope.$apply();
            });

            roomClient.start(token);
        })
    }).catch((error) => {
        console.error(error);
        $scope.failed = true;
        $scope.failMsg = error;
    });
});

//From: https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
