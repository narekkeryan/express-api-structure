var express = require('express');
var router = express.Router();

var LOAD = global.LOAD;

router.use((req, res, next) => {
    'use strict';
    res.status(404);
    res.render('404');
});

router.use((err, req, res, next) => {
    'use strict';
    res.status(500);
    res.send('500');
});

module.exports = router;