const express = require('express');
const router = express.Router();

// * Main Route, this is the same as /users xD
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Gameview',
        auth: req.session.auth || false,
        username: req.session.username,
    });
});

module.exports = {
    path: '/',
    router: router,
};