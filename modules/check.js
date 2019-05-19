const dig = require('gamedig');
const r = require('rethinkdb');
const time = 60 * 1000;
const onFail = () => ({
    success: false,
    ping: 0,
    connect: '-',
});
const onSuccess = (res) => Object.assign(res, {
    success: true,
});
module.exports = async (ser) => {
    const db = ser.db;
    console.time('db');
    const servers = await (await ser.t.run(db)).toArray();
    servers.forEach(x => {
        const key = x.address;
        delete x.address;
        ser.cache.set(key, x);
    });
    console.timeEnd('db');
    await query(db, ser);
};

async function query(db, ser) {
    console.time('dig1');
    const keys = [...ser.cache.keys()];
    const arr = keys.map(x => dig.query({
        'type': 'minecraft',
        'host': x.split(':')[0],
        'port': x.split(':')[1],
    }).then(onSuccess).catch(onFail));
    const resolved = await Promise.all(arr);
    console.timeEnd('dig1');
    const map = new Map();
    for (let i = 0; i < resolved.length; i++) {
        const e = resolved[i];
        map.set(keys[i], {
            'success': e.success,
            'ping': e.ping,
            'players': (e.success) ? e.players.length : 0,
            'maxplayers': (e.success) ? e.maxplayers : 0,
            'time': Date.now(),
        });
    }
    // Inserting everything in rethinkdb, there are probably better ways.
    map.forEach((v, k) => {
        ser.t.get(k).update({
            history: r.row('history').append(v),
        }).run(db);
        const dat = ser.cache.get(k);
        dat.history.push(v);
        ser.cache.set(k, dat);
    });
    setTimeout(() => query(db, ser), time);
}