var LOAD = global.LOAD;
var User =  LOAD.model('User');

var transport = global.transport;

var passport = require('passport');
var bcrypt = require('bcryptjs');
var uniqid = require('uniqid');

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
                                user._hash = uniqid();

                                user.save((err) => {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        var mailOptions = {
                                            from: 'anonymouspr41@gmail.com',
                                            to: user.email,
                                            subject: 'Activate account.',
                                            text: 'http://localhost:3000/user/activate/'+user._id+'/'+user._hash+'/'
                                        };
                                        transport.sendMail(mailOptions, (err, info) => {
                                            if (err) throw err;
                                            req.flash('success', 'You are registered. Check your email to activate your account.');
                                            res.redirect('/');
                                        });
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

    activate (req, res) {
        var _id = req.params._id,
            _hash = req.params._hash;
        User.findById(_id, (err, user) => {
            if (err) throw err;
            if (user && user._hash == _hash) {
                user.status = 1;
                user._hash = undefined;
                user.save((err) => {
                    if (err) throw err;
                    req.flash('success', 'Your account is activated successfully. You can now login.');
                    res.redirect('/');
                });
            } else {
                res.status(404);
                res.render('404');
            }
        });
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

    forgot (req, res) {
        if (req.method == 'POST') {
            req.checkBody('email', 'Email is required.').notEmpty();
            req.checkBody('email', 'Email is not valid.').isEmail();

            var errors = req.validationErrors();

            if (errors) {
                res.render('user/forgot', {
                    errors: errors
                });
            } else {
                User.findOne({ email: req.body.email }, (err, user) => {
                    if (err) throw err;
                    if (user) {
                        user._resetHash = uniqid();
                        user.save((err) => {
                            if (err) throw err;
                            var mailOptions = {
                                from: 'anonymouspr41@gmail.com',
                                to: user.email,
                                subject: 'Reset password.',
                                text: 'http://localhost:3000/user/reset/'+user._id+'/'+user._resetHash+'/'
                            };
                            transport.sendMail(mailOptions, (err, info) => {
                                if (err) throw err;
                                req.flash('success', 'Check your email for recovery password.');
                                res.redirect('/');
                            });
                        });
                    } else {
                        req.flash('warning', 'No user found.');
                        res.redirect('/user/forgot/');
                    }
                });
            }
        } else {
            res.render('user/forgot');
        }
    }

    reset (req, res) {
        if (req.method == 'POST') {
            var _id = req.body.resetId,
                _resetHash = req.body.resetHash;

            req.checkBody('password', 'Password is required.').notEmpty();
            req.checkBody('password', 'Password length must be between 6 to 32 characters.').isLength({min: 6, max: 32});
            req.checkBody('re_password', 'Passwords do not match.').equals(req.body.password);

            var errors = req.validationErrors();
            
            if (errors) {
                console.log(errors);
                res.render('user/reset', {
                    errors: errors,
                    reset: {
                        id: _id,
                        hash: _resetHash
                    }
                });
            } else {
                User.findById(_id, (err, user) => {
                    if (err) throw err;
                    if (user) {
                        user.password = req.body.password;
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(user.password, salt, (err, hash) => {
                                if (err) {
                                    console.error(err);
                                } else {
                                    user.password = hash;
                                    user._resetHash = undefined;

                                    user.save((err) => {
                                        if (err) {
                                            console.error(err);
                                        } else {
                                            if (err) throw err;
                                            req.flash('success', 'Password successfully changed. Now you can login.');
                                            res.redirect('/');
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        } else {
            var _id = req.params._id,
                _resetHash = req.params._resetHash;
            User.findById(_id, (err, user) => {
                if (err) throw err;
                if (user && user._resetHash == _resetHash) {
                    res.render('user/reset', {
                        reset: {
                            id: _id,
                            hash: _resetHash
                        }
                    });
                } else {
                    res.status(404);
                    res.render('404');
                }
            });
        }
    }

    profile (req, res) {
        if (req.method == 'POST') {
            if (req.body.username != req.user.username) {
                req.checkBody('username', 'Username is required.').notEmpty();
                req.checkBody('username', 'Username length must be between 4 to 32 characters.').isLength({min: 4, max: 32});
                req.check('username', 'Username is already taken.').isAvailable('username');
            }
            if (req.body.email != req.user.email) {
                req.checkBody('email', 'Email is required.').notEmpty();
                req.checkBody('email', 'Email is not valid.').isEmail();
                req.check('email', 'Email is already taken.').isAvailable('email');
            }

            req.asyncValidationErrors()
                .then(() => {
                    User.findOneAndUpdate({ _id: req.user.id }, { $set: { username: req.body.username, email: req.body.email }}, (err, user) => {
                        if (err) throw err;
                        req.flash('success', 'Account details changed.');
                        res.redirect('/user/');
                    });
                })
                .catch(errors => {
                    res.render('user/profile', {
                        errors: errors
                    });
                });
        } else {
            res.render('user/profile');
        }
    }
}

var userController = new UserController();

module.exports = userController;