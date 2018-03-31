'use strict';

var express = require('express');

global.expressApp = express();
var expressApp = global.expressApp;

var path = require('path');


/* ******************** LOADER ******************** */
global.LOAD = require('./load');
var LOAD = global.LOAD;
LOAD.setPath(__dirname);


/* ******************** DB ******************** */
global.mongoose = LOAD.config('database');


/* ******************** NODEMAILER ******************** */
var nodemailer = require('nodemailer');
global.transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'USER@gmail.com',
        pass: 'PASS'
    }
});


/* ******************** BODY PARSER MIDDLEWARE ******************** */
var bodyParser = require('body-parser');
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));


/* ******************** EXPRESS SESSION ******************** */
var expressSession = require('express-session');
expressApp.use(expressSession({
    secret: 'YOUR_SECRET',
    resave: true,
    saveUninitialized: true
}));


/* ******************** PASSPORT ******************** */
var passport = require('passport');
expressApp.use(passport.initialize());
expressApp.use(passport.session());


/* ******************** EXPRESS MESSAGES MIDDLEWARE ******************** */
var flash = require('connect-flash');
expressApp.use(flash());
expressApp.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res)();
    next();
});


/* ******************** EXPRESS VALIDATOR MIDDLEWARE ******************** */
global.expressValidator = require('express-validator');
var expressValidator = global.expressValidator;
expressApp.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));


/* ******************** STATIC START ******************** */
const PUBLIC_URL_PATH = '/public';
const PUBLIC_DIR_PATH = path.join(__dirname, PUBLIC_URL_PATH);

expressApp.use(express.static(PUBLIC_DIR_PATH));


/* ******************** VIEW ******************** */
const VIEW_DIR = path.join(__dirname, 'views');
var handlebars = require('express-handlebars');

expressApp.engine('handlebars', handlebars({defaultLayout: 'main', layoutsDir:'server/views/layouts'}));
expressApp.set('views', VIEW_DIR);
expressApp.set('view engine', 'handlebars');


/* ******************** ENSURE AUTHENTICATED ******************** */
global.ensureAuthenticated = (req, res, next) => {
    'use strict';
    if (req.isAuthenticated() || req.path === '/user/login/') {
        return next();
    } else {
        req.flash('danger', 'You need to Log In to continue.');
        res.redirect('/user/login/');
    }
};


/* ******************** ADD SLASH AFTER PATH ******************** */
const addTrailingSlash = (req, res, next) => {
    'use strict';
    if (req.url === req.path && req.path.substr(-1) !== '/') {
        res.redirect(req.path + '/');
    } else {
        next();
    }
};
expressApp.use(addTrailingSlash);


/* ******************** ROUTERS ******************** */
expressApp.set('case sensitive routing', true);
var baseRouter = LOAD.route('base');
expressApp.use('*', baseRouter);
var mainRouter = LOAD.route('index');
expressApp.use('/', mainRouter);
var userRouter = LOAD.route('users');
expressApp.use('/user', userRouter);
var apiRouter = LOAD.route('api');
expressApp.use('/api/v1', apiRouter);
var errorRouter = LOAD.route('errors');
expressApp.use(errorRouter);


process.env.TZ = 'Asia/Yerevan';

/* ******************** SERVER START ******************** */
expressApp.set('port', (process.env.PORT || 3000));
expressApp.listen(expressApp.get('port'), () => console.log('Running on port ' + expressApp.get('port') + '!'));