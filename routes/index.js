const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Gameview',
        auth: req.session.auth || false,
        username: req.session.username,
    });
});

module.exports = router;