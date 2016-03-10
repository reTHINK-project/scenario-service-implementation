/**
 * Created by pzu on 04.02.16.
 */
'use strict';
import mongoose from 'mongoose';

var Schema = mongoose.Schema;
var room = {};

room.schema = new Schema({
    name: String,
    isBooked: Boolean,
    devices: [{type: Schema.Types.ObjectId, ref: 'Device'}],
    members: [String]
});

room.load = function (connection) {
    room.model = connection.model('Room', room.schema);
};
export default room;
