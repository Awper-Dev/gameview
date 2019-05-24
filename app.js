const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const RDBStore = require('session-rethinkdb')(session);
const dotenv = require('dotenv');
const db = require('./modules/database.js');
const r = require('rethinkdb');
const config = require('./connectionInfos.json');
const fs = require('fs');
const GithubWebHook = require('express-github-webhook');
dotenv.config();

const webhookHandler = GithubWebHook({
    path: '/webhook/github',
    secret: process.env.SECRET,
});
const conn = require('rethinkdbdash')({
    servers: [
        config.rethinkdb,
    ],
});
const store = new RDBStore(conn);
const routes = fs.readdirSync('./routes').map(x => require('./routes/' + x));
const app = express();
let users;
let servers;
let updateAvailable = false;
let data = {};
(async () => {
    app.db = await r.connect(config.rethinkdb);
    users = new db(app.db, 'users', 'email', 200);
    servers = new db(app.db, 'servers', 'address', 0);
    require('./modules/check.js')(servers);
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const sessionsettings = {
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
};
const protectCfg = {
    errorPropagationMode: true,
    production: app.get('env') !== 'development',
    clientRetrySecs: 5,
};
const protect = require('overload-protection')('express', protectCfg);

if (app.get('env') !== 'development') {
    app.set('trust proxy', 1);
    sessionsettings.secure = true;
    app.use(logger('short', {
        skip: function (req, res) {
            return res.statusCode < 400;
        },
    }));
    console.log('Trusting Proxy');
} else {
    app.use(logger('dev'));
}

app.use(protect);
app.use(express.json());
app.use(webhookHandler);
app.use(express.urlencoded({
    extended: false,
}));
app.use(cookieParser());
app.use(session(sessionsettings));
webhookHandler.on('push', function (_repo, _data) {
    updateAvailable = true;
    data = _data;
});
app.use((req, res, next) => {
    req.db = app.db;
    req.users = users;
    req.servers = servers;
    req.updateAvailable = updateAvailable;
    if (updateAvailable) {
        req.updateData = data;
        req.resetUpdateVar = () => updateAvailable = false;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
console.log(`Loaded ${routes.length} Routes`);
routes.forEach(x => app.use(x.path, x.router));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
    let error = {};
    console.error(err);
    if (req.app.get('env') === 'development') {
        error = err;
        error.status = err.status || err.statusCode || 500;
    } else {
        error = {
            status: err.status || err.statusCode || 500,
            message: (err.status === 404) ? 'Site not found' : ((err.statusCode || err.status) === 503) ? 'Server is overloaded' : 'Internal Server Error',
        };
    }
    // render the error page
    res.status(error.status || error.statusCode || 500);
    res.render('error', {
        err: error,
    });
});
module.exports = app;