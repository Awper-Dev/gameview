const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const isMail = require('isemail');

// * Does the same as / (file: index.js)
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Gameview',
        auth: req.session.auth || false,
        username: req.session.username,
    });
});

// * Logging a user in and adding some information to his session
router.post('/login', async (req, res, next) => {
    if (req.session.auth) return res.redirect('/users');
    if (!await req.users.has(req.body.email)) return res.redirect('/users/login');
    const {
        password,
        username,
    } = await req.users.get(req.body.email);
    if (bcrypt.compareSync(req.body.password, password)) {
        req.session.username = username;
        req.session.password = password;
        req.session.email = req.body.email;
        req.session.auth = true;
    }
    res.status(200).redirect('/users');
});

// * Logging a user out. This destroys the session.
router.get('/logout', (req, res, next) => {
    if (!req.session.auth) return res.status(400).send('You can\'t logout without being logged in.');
    req.session.destroy();
    res.redirect('/');
});

// * Checks if a mail is already registered. Dunno if this is correct.
router.get('/exists/:mail/', async (req, res) => {
    if (req.session.auth) return res.sendStatus(403);
    if (!req.params.mail) return res.sendStatus(400);
    res.send(await req.users.has(req.params.mail));
});

// * Register a new user.
// ! Emails is only checked by a regex, this is not optimal.
router.post('/register', async (req, res, next) => {
    if (req.session.auth) return res.redirect('/users');
    const {
        email,
        username,
        password,
    } = req.body;

    if (!((username && username.length > 2) && (password && password.length > 6) && isMail.validate(email))) return res.sendStatus(400);
    await req.users.set(email, {
        'username': username,
        'password': bcrypt.hashSync(password, parseInt(process.env.SALT)),
        'lastIPs': [{
            ip: req.ip,
            time: Date.now(),
        }],
    });
    res.status(201).redirect('/users/login');
});


// * The login page.
router.get('/login', (req, res) => {
    if (req.session.auth) return res.redirect('/users');
    res.render('login');
});

// ! path: /users
module.exports = {
    path: '/users',
    router: router,
};