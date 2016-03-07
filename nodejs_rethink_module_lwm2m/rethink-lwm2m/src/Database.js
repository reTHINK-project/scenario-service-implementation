/**
 * Created by pzu on 11.02.16.
 */
import db from './models/db';
import hotel from './models/Hotel';


class Database {

    constructor(host = 'localhost', dbname = 'hotel') {
        this._host = host;
        this._dbname = dbname;
        this.hotel = hotel; //This is needed to fix scope-issues (async calls)
        this.db = db;
    }

    connect(callback) {
        if (!this.connected()) {
            db.init(this._host, this._dbname, function () {
                callback();
            })
        }
        else {
            callback(new Error("Already connected or connection pending!"));
        }
    }

    disconnect(callback) {
        if (this.connected()) {
            db.connection.close(function () { //TODO: error-callback?
                callback();
            })
        }
        else {
            callback(new Error("Can't close db-connection: Not connected!"));
        }
    }

    connected() {
        if (typeof db.connection !== 'undefined') {
            return db.connection.readyState === 1 || db.connection.readyState === 2;
        }
        else {
            return false;
        }
    }

    //TODO: sync?, improve check? Could compare db-attributes with cfg-attr.
    isInitialised(callback) {
        this.db.connection.db.listCollections({name: 'hotels'}) //appended 's' is mongoose-behavior, see: http://bit.ly/1Lq65AJ)
            .next(function (err, collinfo) {
                callback(typeof collinfo !== 'undefined' && collinfo !== null, err);
            });
    }

    get connection() {
        return db.connection;
    }

    createHotel(config, callback) {
        if (typeof config === 'undefined') {
            return callback(new Error("Missing config!"));
        }
        else {
            if (!this.connected()) {
                return callback(new Error("Can't save data to db! Not connected!"));
            }
            else {
                var HotelModel = this.hotel.model;
                var newHotel = new HotelModel();

                if (typeof config.name === 'undefined') {
                    return callback(new Error("Hotel-Name is mandatory!"));
                }
                else {
                    newHotel.name = config.name;

                    if (typeof config.rooms !== 'undefined') {
                        newHotel.rooms = config.rooms;
                    }

                    newHotel.save(function (error) {
                        callback(error);
                    })
                }
            }
        }
    }
}

export default Database;