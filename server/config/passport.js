var LOAD = global.LOAD;
var User = LOAD.model('User');

var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

module.exports = (passport) => {
    passport.use(new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown user.' })
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Wrong password'});
                }
            });
        });
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};