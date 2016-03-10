/**
 * Created by pzu on 04.02.16.
 */
'use strict';
import logger from 'logops';
import mongoose from 'mongoose';
import device from './Device';
import hotel from './Hotel';
import room from './Room';

var db = {};
db.connection = {};

db.init = function (host, database, callback) {
    db.connection = mongoose.createConnection(host, database);
    db.connection.on('error', function mongodbErrorHandler(error) {
        logger.fatal('Could not establish connection to mongodb!', error);
        throw new Error(error);
    });
    db.connection.once('open', function () {
        logger.debug('Database.js: connected to mongodb!');
        device.load(db.connection);
        hotel.load(db.connection);
        room.load(db.connection);

        callback();
    });

};

export default db;
