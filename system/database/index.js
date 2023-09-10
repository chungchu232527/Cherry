module.exports = function({ Language, Cherry, api, utils }) {
    var { writeFileSync, existsSync, mkdirSync } = require('fs');

    if (!existsSync(__dirname + '/data/')) mkdirSync(__dirname + '/data/');
    if (!existsSync(__dirname + '/data/Threads.json')) writeFileSync(__dirname + '/data/Threads.json', '{}');
    if (!existsSync(__dirname + '/data/Users.json')) writeFileSync(__dirname + '/data/Users.json', '{}');

    var Threads = require('./Threads') ({ Language, Cherry, api, utils });
    var Users = require('./Users') ({ Language, Cherry, api, utils });

    return {
        Users,
        Threads
    }
}