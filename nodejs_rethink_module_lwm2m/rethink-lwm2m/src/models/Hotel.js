/**
 * Created by pzu on 04.02.16.
 */
'use strict';
import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import room from './Room';

var Schema = mongoose.Schema;
var hotel = {};

hotel.schema = new Schema({
    name: {type: String, unique: true},
    rooms: [room.schema]
});

hotel.load = function (connection) {
    hotel.schema.plugin(autoIncrement.plugin, 'Hotel');
    hotel.model = connection.model('Hotel', hotel.schema);
};
export default hotel;