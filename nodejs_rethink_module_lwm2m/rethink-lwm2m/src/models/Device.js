'use strict';
import mongoose from 'mongoose';

var Schema = mongoose.Schema;
var device = {};

device.schema = new Schema({
    name: {type: String, unique: true},
    room: {type: Schema.Types.ObjectId, ref: 'Room'},

    registration: {
        registered: {type: Boolean, default: false},
        timestamp: {type: Date, default: Date.now}
    },
    lastValue: {
        value: Object,
        timestamp: {type: Date, default: Date.now}
    }
});

device.load = function (connection) {
    device.model = connection.model('Device', device.schema);
};

export default device;