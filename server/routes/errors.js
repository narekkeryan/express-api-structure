var express = require('express');
var router = express.Router();

var LOAD = global.LOAD;

// TODO: change add styled views for error pages

router.use((req, res, next) => {
    'use strict';
    res.status(404);
    res.send('404 - Nothing Found.');
});

router.use((err, req, res, next) => {
    'use strict';
    res.status(500);
    res.send('Internal server error');
});

module.exports = router;