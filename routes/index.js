const express = require('express');
const router = express.Router();
const {
    exec,
} = require('child_process');
// * Main Route, this is the same as /users xD
router.get('/', function (req, res) {
    let data = '';
    if (req.updateAvailable && req.session.admin) req.updateData.commits.forEach(v => data += `[[${v.author.username}]]: ${v.message}`);

    res.render('index', {
        title: 'Gameview',
        auth: req.session.auth || false,
        username: req.session.username,
        admin: req.session.admin,
        updateAvailable: (req.session.admin) ? req.updateAvailable : false,
        updateData: (req.session.admin) ? data : data,
    });
});

// ! Updates the whole code if possible, can only be run by owner
router.get('/update', function (req, res) {
    if (!req.session.admin) return res.status(401).send('endpoint may only be used by admin');
    if (!req.updateAvailable) return res.status(400).send('No update available');
    exec('git pull origin master', async (err, stdout) => {
        if (err) throw err;
        if (stdout === 'Already up-to-date.\n') return res.status(200).send(stdout);
        console.log('Updated code. restarting now');
        res.status(200).send('Restarting in 3 Seconds');
        req.resetUpdateVar();
        setTimeout(() => process.exit(0), 3000);
    });
});

module.exports = {
    path: '/',
    router: router,
};