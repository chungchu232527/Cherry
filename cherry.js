var log = require('./system/log');
var utils = require('./system/utils');
var configs = require('./configs.json');
var { execSync } = require('child_process');
var Language = require('./system/language') ({ configs, utils, log });
var CHCP = execSync('CHCP').toString();
if (!CHCP.includes('65001')) execSync('CHCP 65001');

async function checkCookies(callback) {
    log('Cherry', Language('system', 'cookieChecking'), 'magenta');
    var { readFileSync, existsSync } = require('fs');
    if (!existsSync('./cookies.json')) return callback(null);
    var cookies = readFileSync('./cookies.json', 'utf-8').toString();
    if (cookies.startsWith('[') && cookies.endsWith(']')) return callback(JSON.parse(cookies));
    var key = utils.readLine('\x1b[33m' + Language('system', 'decryptCookies') + '\x1b[0m', true, true);
    cookies = utils.decrypt(key, cookies);
    if (cookies.startsWith('[') && cookies.endsWith(']')) return callback(JSON.parse(cookies), key);
    return checkCookies(callback);
}

async function startServer(callback) {
    if (!configs.enableServer) return callback();
    log('Cherry', Language('system', 'startServer'), 'magenta');
    var server = require('./server');
    var port = Math.floor(Math.random() * (9999 - 1000) + 1000);
    return server.listen(port, function() {
        log('Cherry', Language('system', 'serverStarted', port), 'warn');
        return callback(server);
    });
}

async function launchApp(cookies, key, server) {
    var MetaAPI = require('@hoahenry/meta-api');
    var Core = require('./system/core/') ({ Language, utils, log, configs, server, key });
    MetaAPI({ cookies, email: configs.email, password: configs.password, configs: configs.loginOptions }, Core);
}

return checkCookies(function(cookies, key) {
    return startServer(function(server) {
        return launchApp(cookies, key, server);
    });
})