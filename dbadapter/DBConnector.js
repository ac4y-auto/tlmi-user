var mongoose = require('mongoose');
var logger = require('../element/Ac4yLogger.js').getLogger('dbadapter');

var MONGODB_URI = 'mongodb://localhost:27017/ac4y';

async function connect() {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('MongoDB connected: ' + MONGODB_URI);
    } catch (err) {
        logger.error('MongoDB connection failed: ' + err.message);
        throw err;
    }
}

module.exports = {
    connect: connect,
    mongoose: mongoose
};

/*
// --- Régi MySQL/Knex/Objection konfiguráció ---
const Knex = require('knex');
const knexConfig = require('./knexfile');
const Model = require('objection').Model;
const DBConnector = Knex(knexConfig.production);
Model.knex(DBConnector);

exports.DBConnector = DBConnector;
exports.Model = Model;
*/
