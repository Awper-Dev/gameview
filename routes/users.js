const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const bcrypt = require('bcrypt');
const isMail = require('isemail');

router.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Gameview',
        auth: req.session.auth || false,
        username: req.session.username,
    });
});

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
        req.session.auth = true;
    }
    res.redirect('/users');
});

router.get('/logout', (req, res, next) => {
    if (!req.session.auth) return res.status(400).send('You can\'t logout without being logged in.');
    req.session.destroy();
    res.redirect('/');
});

router.get('/exists/:mail/', async (req, res, next) => {
    if (req.session.auth) return res.sendStatus(403);
    if (!req.params.mail) return res.sendStatus(400);
    res.send(await req.users.has(req.params.mail));
});

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
    res.redirect('/users/login');
});

router.get('/login', (req, res, next) => {
    if (req.session.auth) return res.redirect('/users');
    res.render('login');
});


module.exports = router;