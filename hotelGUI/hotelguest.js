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
app.controller('hotelGuestController', function ($scope) {

    var roomClient;

    window.rethink.default.install({domain: 'hybroker.rethink.ptinovacao.pt', development: true}).then((runtime) => {
        runtime.requireHyperty("hyperty-catalogue://hybroker.rethink.ptinovacao.pt/.well-known/hyperty/RoomClient").then((hyperty) => {
            roomClient = hyperty.instance;
            console.log(hyperty);

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
            })

        })
    });


    $scope.cc = window.colorConversion;

    var hotel = {
        thumbnailUrl: "img/hotel-thumbnail.jpg",
        name: "MyHotel",
        description: "The best Hotel in the world!",
        rooms: [
            // {
            //     "__v": 1,
            //     "_id": "57690ec61dbc906c2ed8252b",
            //     "isBooked": true,
            //     "name": "DUMMY",
            //     "members": [],
            //     "devices": [{
            //         "__v": 2,
            //         "_id": "57690ec61dbc906c2ed8252e",
            //         "name": "myRaspberry",
            //         "room": "57690ec61dbc906c2ed8252b",
            //         "lastValues": {
            //             "misc": [],
            //             "light": [{
            //                 "_id": "57690ef71dbc906c2ed82531",
            //                 "dimmer": 75,
            //                 "id": 1,
            //                 "isOn": true,
            //                 "name": "Desklamp",
            //                 "timestamp": "2016-06-21T12:42:53.009Z",
            //                 "color": {
            //                     "unit": "CIE_JSON",
            //                     "value": {
            //                         "x": 0.3514825534134924,
            //                         "y": 0.36724112917562374
            //                     }
            //                 }
            //             },
            //                 {
            //                     "_id": "57690ef71dbc906c2ed82531",
            //                     "dimmer": 100,
            //                     "id": 2,
            //                     "isOn": false,
            //                     "name": "Ceiling Lamp",
            //                     "timestamp": "2016-06-21T12:42:53.009Z",
            //                     "color": {
            //                         "unit": "CIE_JSON",
            //                         "value": {"x": 0.32272672086556803, "y": 0.3290229095590793}
            //                     }
            //                 }],
            //             "humidity": [{
            //                 "_id": "57690efa1dbc906c2ed82532",
            //                 "id": 1,
            //                 "unit": "%",
            //                 "value": 75,
            //                 "timestamp": "2016-06-21T12:46:07.735Z"
            //             }],
            //             "temperature": [{
            //                 "_id": "57690efa1dbc906c2ed82532",
            //                 "id": 0,
            //                 "unit": "Cel",
            //                 "value": 26.4,
            //                 "timestamp": "2016-06-21T12:46:07.735Z"
            //             },
            //                 {
            //                     "_id": "57690efa1dbc906c2ed82532",
            //                     "id": 1,
            //                     "unit": "Cel",
            //                     "value": 22.7,
            //                     "timestamp": "2016-06-21T12:46:07.735Z"
            //                 }]
            //         },
            //         "registration": {
            //             "payload": "</3311/1>,</3303/0>",
            //             "timestamp": "2016-06-21T12:13:05.024Z",
            //             "registered": true
            //         }
            //     }]
            // }
        ]
    };
    $scope.hotel = hotel;

    $scope.setDimmer = function (dimmerVal) {
        console.log()
    }
});