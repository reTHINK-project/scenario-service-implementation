'use strict';
import mongoose from 'mongoose';

var Schema = mongoose.Schema;
var device = {};

device.schema = new Schema({
    id: String,
    registration: {
        registered: Boolean,
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