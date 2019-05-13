Website to collect data of (currently only minecraft) Servers and notify downtime.

To start the project run `npm start`

### Development Infos:
`connectionInfo.json` has to look like this:
```xl
{
    "rethindb": {
        "db": "gameview",
        "host": "<ipordomain>",
        "user": "gameview",
        "password": "<coolpassword>"
    }
}
```
the `.env` file has to look like this:
```xl
PORT=3000
NODE_ENV=development
SECRET=<secrethere>
SALT=<salthere>
```
##### (change NODE_ENV if its in production)
