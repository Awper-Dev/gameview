const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const isMail = require('isemail');
// ! account create has to be changed on serverside, or ugly errors.
// * Does the same as / (file: index.js)
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Gameview',
        auth: req.session.auth || false,
        username: req.session.username,
    });
});

// * Logging a user in and adding some information to his session
router.post('/login', async (req, res) => {
    if (req.session.auth) return res.redirect('/users');
    if (!req.body.email || !req.body.password) return res.status(400).send('Password or E-mail not provided');
    if (!await req.users.has(req.body.email)) return res.status(400).send('Unknown E-mail and Password combination');
    const {
        password,
        username,
    } = await req.users.get(req.body.email);
    if (bcrypt.compareSync(req.body.password, password)) {
        req.session.username = username;
        req.session.password = password;
        req.session.email = req.body.email;
        req.session.auth = true;
        const data = await req.users.get(req.body.email);
        data.lastIPs.push({
            ip: req.ip,
            time: Date.now(),
        });
        await req.users.set(req.body.email, data);
        res.status(200).send('Success. You will be redirected.');
        return;
    }
    res.status(400).send('Unknown E-mail and Password combination');
});

// * Logging a user out. This destroys the session.
router.get('/logout', async (req, res) => {
    if (!req.session.auth) return res.status(400).send('You can\'t logout without being logged in.');
    await req.session.destroy();
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
router.post('/register', async (req, res) => {
    if (req.session.auth) return res.redirect('/users');
    const {
        email,
        username,
        password,
    } = req.body;
    if (!username || username.length < 2) return res.status(400).send('Username not provided or too short');
    if (!password || password.length < 6) return res.status(400).send('Password not provided or too short');
    if (!isMail.validate(email)) return res.status(400).send('Not a valid email');
    if (req.users.has(email)) return res.status(400).send('This email is already registered');
    await req.users.set(email, {
        'username': username,
        'password': bcrypt.hashSync(password, parseInt(process.env.SALT)),
        'lastIPs': [{
            ip: req.ip,
            time: Date.now(),
        }],
    });
    res.status(200).send('Success. You will be redirected.');
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