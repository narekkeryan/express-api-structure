var LOAD = global.LOAD;
var User =  LOAD.model('User');

var passport = require('passport');
var bcrypt = require('bcryptjs');

class UserController {
    register (req, res) {
        if (req.method == 'POST') {
            req.checkBody('username', 'Username is required.').notEmpty();
            req.checkBody('username', 'Username length must be between 4 to 32 characters.').isLength({min: 4, max: 32});
            req.check('username', 'Username is already taken.').isAvailable('username');
            req.checkBody('email', 'Email is required.').notEmpty();
            req.checkBody('email', 'Email is not valid.').isEmail();
            req.check('email', 'Email is already taken.').isAvailable('email');
            req.checkBody('password', 'Password is required.').notEmpty();
            req.checkBody('password', 'Password length must be between 6 to 32 characters.').isLength({min: 6, max: 32});
            req.checkBody('re_password', 'Passwords do not match.').equals(req.body.password);

            req.asyncValidationErrors()
                .then(() => {
                    var user = new User();
                    user.username = req.body.username;
                    user.email = req.body.email;
                    user.password = req.body.password;

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) {
                                console.error(err);
                            } else {
                                user.password = hash;

                                user.save((err) => {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        req.flash('success', 'You are registered and can log in.');
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    });
                })
                .catch(errors => {
                    res.render('user/register', {
                        errors: errors
                    });
                });
        } else {
            res.render('user/register');
        }
    }

    login (req, res, next) {
        if (req.method == 'POST') {
            passport.authenticate('local', { successRedirect: '/', failureRedirect: '/user/login/', failureFlash: true })(req, res, next);
        } else {
            res.render('user/login');
        }
    }

    logout (req, res) {
        req.logout();
        req.flash('success', 'Logged out');
        res.redirect('/');
    }
}

var userController = new UserController();

module.exports = userController;