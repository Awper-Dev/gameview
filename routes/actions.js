const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');

// * Created to add Servers that should be pinged. It requires a IP and optional port.

router.post('/addserver', auth, async (req, res) => {
    const {
        ip,
        port,
    } = req.body;
    let out = ip;
    if (!(typeof ip === 'string' && ip.length > 2)) return res.status(400).send('`IP` has to be a valid ip address or domain.');
    if (port) out += ':' + port;
    const data = await req.servers.get(out) || {};
    if (Object.keys(data).length < 1) {
        data.owners = [req.session.email];
        data.history = [];
    }
    if (!data.owners.includes(req.session.email)) {
        data.owners.push(req.session.email);
    }
    await req.servers.set(out, data);
    res.status(201).send(`Server "${out}" added to user "${req.session.username}"`);
});

// ! path: /actions
module.exports = {
    path: '/actions',
    router: router,
};