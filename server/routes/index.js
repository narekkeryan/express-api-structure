var express = require('express');
var router = express.Router();

var LOAD = global.LOAD;

/* ******************** MAIN PAGE ******************** */
var mainController = LOAD.controller('MainController');

router.get('/', mainController.mainPage);

module.exports = router;