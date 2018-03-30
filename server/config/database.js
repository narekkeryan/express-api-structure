var mongoose = require('mongoose');

var db = {
    'name': 'express-restful',
    'user': 'narekkeryan',
    'pass': 'aBK15d52cyRuhZ3l',
    'host': 'ds229609.mlab.com:29609'
};

mongoose.connect(`mongodb://${db.user}:${db.pass}@${db.host}/${db.name}`);

var dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'Connection error.'));
dbConnection.once('open', console.log.bind(console, 'Connected to mongo.'));

module.exports = mongoose;