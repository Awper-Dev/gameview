const lru = require('quick-lru');
const r = require('rethinkdb');
const _ = require('lodash');
class DB_Cache {
    /**
     *Creates an instance of DB_Cache.
     * @param {rethinkdb connection} conn the connection to the rethinkdb
     * @param {string} table the table name
     * @param {string} keyInDb the name of the Primary Key
     * @param {number} [maxSize=100]
     * @memberof DB_Cache
     */
    constructor(conn, table, keyInDb, maxSize = 100) {
        this.cache = new lru({
            'maxSize': maxSize,
        });
        this.db = conn;
        this.table = table;
        this.keyInDb = keyInDb;
    }

    /**
     *Get a object from the db
     * @param {*} key
     * @returns {Promise}
     * @memberof DB_Cache
     */
    _getFromDB(key) {
        return this.t.get(key).run(this.db);
    }

    /**
     *Get a cached object
     * @param {*} key
     * @returns {object}
     * @memberof DB_Cache
     */
    _getFromCache(key) {
        return this.cache.get(key);
    }

    /**
     *Gets the requested object by primary key by the cache or database
     * @param {*} key the primary key you search for
     * @returns {object} requested Object without the key or undefined if not found
     * @memberof DB_Cache
     */
    async get(key, path) {
        const out = this._getFromCache(key) || await this._getFromDB(key);
        if (out) delete out[this.keyInDb];
        this.cache.set(key, out);
        if (path) return _.get(out, path);
        return out;
    }

    /**
     *Deletes the value out of the cache and gets it again
     * @param {*} key single key or array of keys
     * @returns {undefined}
     * @memberof DB_Cache
     */
    async refresh(key) {
        if (Array.isArray(key)) {
            await Promise.all(key.map(e => {
                this.cache.delete(e);
                this.get(e);
            }));
            return;
        }
        this.cache.delete(key);
        return this.get(key);
    }

    /**
     *Sets the value in the cache and db
     * @param {*} key the primary key to the value
     * @param {object} value the value to set
     * @returns {object} returns the value parameter
     * @memberof DB_Cache
     */
    async set(key, value) {
        const obj = value;
        obj[this.keyInDb] = key;
        this.t.insert(obj).run(this.db);
        this.cache.set(key, value);
        return value;
    }

    /**
     *Checks if the key is available in the cache or db, this will not cache the value
     * @param {*} key
     * @returns {bool} if the key is in the cache or db
     * @memberof DB_Cache
     */
    async has(key) {
        return this.cache.has(key) || !!(await this._getFromDB(key));
    }

    /**
     *returns already selected table
     * @readonly
     * @memberof DB_Cache
     */
    get t() {
        return r.table(this.table);
    }
}
module.exports = DB_Cache;