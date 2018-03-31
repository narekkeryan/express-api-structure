var mongoose = require('mongoose');

var db = {
    'name': 'DB_NAME',
    'user': 'DB_USER',
    'pass': 'DB_PASS',
    'host': 'DB:HOST:PORT'
};

mongoose.connect(`mongodb://${db.user}:${db.pass}@${db.host}/${db.name}`);

var dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'Connection error.'));
dbConnection.once('open', console.log.bind(console, 'Connected to mongo.'));

module.exports = mongoose;