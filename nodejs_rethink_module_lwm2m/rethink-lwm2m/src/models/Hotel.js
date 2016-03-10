/**
 * Created by pzu on 04.02.16.
 */
'use strict';
import mongoose from 'mongoose';

//Assuming Hotel is singleton (in db scope)

var Schema = mongoose.Schema;
var hotel = {};

hotel.schema = new Schema({
    name: {type: String, unique: true},
    rooms: [{type: Schema.Types.ObjectId, ref: 'Room'}]
});

hotel.load = function (connection) {
    hotel.model = connection.model('Hotel', hotel.schema);
};
export default hotel;