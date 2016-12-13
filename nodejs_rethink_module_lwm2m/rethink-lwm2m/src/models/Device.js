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
import mongoose from "mongoose";

var Schema = mongoose.Schema;
var device = {};

device.schema = new Schema({
    name: {type: String, unique: true},
    room: {type: Schema.Types.ObjectId, ref: 'Room'},

    registration: {
        registered: {type: Boolean, default: false},
        timestamp: {type: Date, default: Date.now},
        payload: String
    },
    lastValues: {
        temperature: [
            {
                id: {type: Number, unique: true},
                value: Number,
                unit: String,
                timestamp: {type: Date, default: Date.now}
            }
        ],
        humidity: [
            {
                id: {type: Number, unique: true},
                value: Number,
                unit: String,
                timestamp: {type: Date, default: Date.now}
            }
        ],
        light: [
            {
                id: {type: Number, unique: true},
                name: String,
                isOn: Boolean,
                dimmer: Number,
                color: {
                    value: [Number, Number], //x,y
                    unit: String
                },
                timestamp: {type: Date, default: Date.now}
            }
        ],
        actuator: [
            {
                id: {type: Number, unique: true},
                name: String,
                isOn: Boolean,
                applicationType: String,
                timestamp: {type: Date, default: Date.now}
            }
        ],
        misc: [
            {
                uri: String,
                value: String,
                timestamp: {type: Date, default: Date.now}
            }
        ]
    }
});

device.load = (connection) => {
    device.model = connection.model('Device', device.schema);
};

export default device;