var express = require('express');
var router = express.Router();

var LOAD = global.LOAD;
var User = LOAD.model('User');

var expressValidator = global.expressValidator;
router.use(expressValidator({
    customValidators: {
        isAvailable (value, param) {
            var condition = {};
            condition[param] = value;
            return new Promise((resolve, reject) => {
                User.findOne(condition, {'__v': 0}, (err, user) => {
                    if (err) throw err;
                    if (user == null) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        }
    }
}));

var passport = require('passport');
LOAD.config('passport')(passport);
router.use(passport.initialize());
router.use(passport.session());

/* ******************** MAIN PAGE ******************** */
var userController = LOAD.controller('UserController');

router.get('/register/', userController.register);
router.post('/register/', userController.register);
router.get('/login/', userController.login);
router.post('/login/', userController.login);
router.post('/logout/', userController.logout);

module.exports = router;