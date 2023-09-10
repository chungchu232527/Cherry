module.exports = function({ Language, Cherry, api, utils }) {
    var data = require(__dirname + '/data/Users.json'), { writeFileSync } = require('fs');
    var saveData = () => writeFileSync(__dirname + '/data/Users.json', JSON.stringify(data, null, 4));

    function get(userID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(userID, 'String', 'Number', 'Array')) return callback(Language('system', 'wrongType', 'userID', 'String, Number, Array'));
        if (String.isString(userID) && !data[userID]) return callback(Language('system', 'doesNotExist', 'User', userID));
        if (!Array.isArray(userID)) userID = [userID];
        var _data = {};
        for (let ID of userID) if (data[ID]) _data[ID] = data[ID];
        return callback(null, userID.length > 1 ? _data : _data[userID[0]]);
    }

    function getKey(keys = [], callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!keys || !Array.isArray(keys) || keys.length === 0) return callback(null, data);
        let _data = {};
        for (let ID in data) {
            _data[ID] = {};
            for (let key of keys) _data[ID][key] = data[ID][key];
        }
        return callback(null, _data);
    }

    function set(userID, options = {}, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(userID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'userID', 'String, Number'));
        if (!data[userID]) return callback(Language('system', 'doesNotExist', 'User', userID));
        data[userID] = { ...data[userID] || {}, ...options };
        saveData(data);
        return callback(null, data[userID]);
    }

    async function create(userID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(userID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'userID', 'String, Number'));
        let i = await getInfo(userID);
        var _data = {
            [userID]: {
                ID: userID,
                name: i.name,
                facebookID: i.vanity || userID,
                sex: Language('system', i.gender === 1 ? 'female' : 'male'),
                isBirthday: i.isBirthday,
                createTime: Date.now(),
                lastUpdate: Date.now()
            }
        }
        Object.assign(data, _data);
        saveData(data);
        return callback(null, _data);
    }
    
    function remove(userID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(userID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'userID', 'String, Number'));
        delete data[userID];
        saveData(data);
        return callback(data);
    }
    
    function getInfo(userID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!Array.isArray(userID)) userID = [userID];
        return api.getUsersInfo(userID, function(e, i) {
            return e ? callback(e) : callback(null, userID.length > 1 ? i : i[userID[0]]);
        })
    }

    var has = (userID) => !!data[userID];
    var isBanned = (userID) => !!data[userID] && !!data[userID].banned;
    var isBusy = (userID) => !!data[userID] && !!data[userID].busyData;
    var totalUsers = () => Object.keys(data).length;
    var Users = function(userID, callback) {
        return get(userID, callback);
    }

    return Object.assign(Users, {
        get,
        getKey,
        set,
        create,
        remove,
        has,
        isBanned,
        isBusy,
        totalUsers,
        getInfo
    })
}