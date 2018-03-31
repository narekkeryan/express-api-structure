var express = require('express');
var router = express.Router();

var bcrypt = require('bcryptjs');

var LOAD = global.LOAD;
var User = LOAD.model('User');

var jwt = require('jsonwebtoken');
var apiSecret = LOAD.config('main').api.secret;

var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
    windowMs: 20*60*1000,
    max: 5,
    delayMs: 0,
    message: 'To many requests, please try again after 20 minutes.'
});
router.use(limiter);

router.post('/users/auth/', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) throw err;
        if (!user) {
            res.json({
                success: false,
                message: 'Unknown user.'
            });
        } else {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    if (user.status == 1) {
                        var token = jwt.sign({ id: user._id }, apiSecret, { expiresIn: 86400 });
                        res.json({
                            success: true,
                            message: 'Token successfully signed.',
                            token: token
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'First activate profile by email.'
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: 'Wrong password'
                    });
                }
            });
        }
    });
});

router.use((req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, apiSecret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get('/users/', (req, res) => {
    User.find({}, (err, users) => {
        if (err) throw err;
        res.json(users)
    });
});


module.exports = router;