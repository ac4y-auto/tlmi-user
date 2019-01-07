const Knex = require('knex');
const knexConfig = require('./knexfile');
const Model = require('objection').Model;
const DBConnector = Knex(knexConfig.production);  
Model.knex(DBConnector);

exports.DBConnector = DBConnector;
exports.Model = Model;

/*
const knex = Knex({
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'manage',
      database: 'ac4y'
    },
      pool: {
      min: 2,
      max: 10
    }
  });
*/