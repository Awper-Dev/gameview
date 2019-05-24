const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');

// * Created to add Servers that should be pinged. It requires a IP and optional port.

router.post('/addserver', auth, async (req, res) => {
    const {
        ip,
        port,
    } = req.body;
    let out = ip.trim();
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

router.post('/removeserver', auth, async (req, res) => {
    const {
        ip,
    } = req.body;
    const out = ip.trim();
    const data = await req.servers.get(out);
    if (!data) return res.status(400).send('This Server was never added to our System');
    if (!data.owners.includes(req.session.email)) return res.status(400).send('You never subscribed to this Server');
    data.owners.splice(data.owners.indexOf(req.session.email));
    if (data.owners.length < 1) await req.servers.delete(out);
    else await req.servers.set(out, data);
    res.status(201).send(`Server "${out}" removed from user "${req.session.username}"`);
});

router.get('/getservers', auth, async (req, res) => {
    const servers = [];
    req.servers.cache.forEach((v, k) => {
        if (!v.owners.includes(req.session.email)) return;
        v.history.sort((a, b) => b.time - a.time);
        servers.push({
            ip: k,
            online: (v.history.length > 0) ? v.history[0].success : false,
            ping: (v.history.length > 0) ? v.history[0].ping : 0,
            extra: (v.history.length < 1) ? 'Server was not pinged yet.' : '',
            players: (v.history.length > 0) ? v.history[0].players : 0,
        });
    });
    res.status(200).send(servers);
});

// ! path: /actions
module.exports = {
    path: '/actions',
    router: router,
};