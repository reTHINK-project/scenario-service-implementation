/**
 * Created by pzu on 04.02.16.
 */
'use strict';
import mongoose from 'mongoose';
import device from './Device';

var Schema = mongoose.Schema;
var room = {};

room.schema = new Schema({
    isBooked: Boolean,
    id: String,
    devices: [device.schema],
    members: [String]
});

room.load = function (connection) {
    room.model = connection.model('Room', room.schema);
};
export default room;
