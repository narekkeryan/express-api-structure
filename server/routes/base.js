var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
    'use strict';
    res.locals.user = req.user || null;
    next();
});

module.exports = router;