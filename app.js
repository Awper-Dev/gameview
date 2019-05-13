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
dotenv.config();
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
(async () => {
    app.db = await r.connect(config.rethinkdb);
    users = new db(app.db, 'users', 'email', 200);
    servers = new db(app.db, 'servers', 'address', 0);
    require('./modules/check.js')(servers);
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (app.get('env') !== 'development') {
    app.set('trust proxy', 1);
    session.secure = true;
    console.log('Trusting Proxy');
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false,
}));
app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
}));

app.use((req, res, next) => {
    req.db = app.db;
    req.users = users;
    req.servers = servers;
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
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;