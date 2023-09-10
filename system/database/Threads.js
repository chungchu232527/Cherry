module.exports = function({ Language, Cherry, api, utils }) {
    var data = require(__dirname + '/data/Threads.json'), { writeFileSync } = require('fs');
    var saveData = () => writeFileSync(__dirname + '/data/Threads.json', JSON.stringify(data, null, 4));

    function get(threadID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number', 'Array')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number, Array'));
        if (String.isString(threadID) && !data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        if (!Array.isArray(threadID)) threadID = [threadID];
        let _data = {};
        for (let ID of threadID) if (data[ID]) _data[ID] = data[ID];
        return callback(null, threadID.length > 1 ? _data : _data[threadID[0]]);
    }

    function getAllID(isGroup, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        let allThreadIDs = Object.keys(data).filter(threadID => !isGroup || isGroup && data[threadID].isGroup);
        return callback(null, allThreadIDs);
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

    function getMember(threadID, memberID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        if (!utils.includes(memberID, 'String', 'Number', 'Array')) return callback(Language('system', 'wrongType', 'memberID', 'String, Number, Array'));
        if (!data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        if (String.isString(memberID) && !data[threadID]) return callback(Language('system', 'doesNotExist', 'Member', memberID));
        if (!Array.isArray(memberID)) memberID = [memberID];
        let _data = {};
        for (let ID of memberID) if (data[threadID] && data[threadID].members[ID]) _data[ID] = data[threadID].members[ID];
        return callback(null, memberID.length > 1 ? data : data[memberID[0]]);
    }

    function set(threadID, options = {}, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        if (!data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        data[threadID] = { ...data[threadID] || {}, ...options };
        saveData(data);
        return callback(null, data[threadID]);
    }

    async function create(threadID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        let i = await getInfo(threadID);
        let _data = {
            [threadID]: {
                ID: threadID,
                name: i.threadName,
                prefix: Cherry.configs.prefix,
                emoji: i.emoji,
                members: {},
                color: i.color,
                totalMsg: i.messageCount,
                adminIDs: i.adminIDs,
                isGroup: i.isGroup,
                inviteLink: i.inviteLink,
                createTime: Date.now(),
                lastUpdate: Date.now()
            }
        };
        Object.assign(data, _data);
        saveData(data);
        return callback(null, _data);
    }

    function getInfo(threadID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!Array.isArray(threadID)) threadID = [threadID];
        return api.getThreadsInfo(threadID, function(e, i) {
            return e ? callback(e) : callback(null, threadID.length > 1 ? i : i[threadID[0]]);
        })
    }

    function addMember(memberID, threadID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        if (!utils.includes(memberID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'memberID', 'String, Number'));
        if (!data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        return getInfo(threadID, function(e, i) {
            if (e) return callback(e);
            let _data = {
                [memberID]: {
                    ID: memberID,
                    message: {
                        days: 0,
                        weeks: 0,
                        months: 0,
                        years: 0,
                        total: 0
                    },
                    nickname: i.nicknames[memberID]
                }
            }
            Object.assign(data[threadID].members, _data);
            saveData(data);
            return callback(null, _data);
        });
    }

    function increaseMsg(threadID, memberID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        if (!utils.includes(memberID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'memberID', 'String, Number'));
        if (!data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        if (!data[threadID].members[memberID]) return callback(Language('system', 'doesNotExist', 'Member', memberID));
        Object.keys(data[threadID].members[memberID].message).forEach(type => {
            data[threadID].members[memberID].message[type]++;
        })
        saveData(data);
        return callback(null, data);
    }

    function resetMsg(threadID, memberID, type, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        if (!utils.includes(memberID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'memberID', 'String, Number'));
        if (!data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        if (!data[threadID].members[memberID]) return callback(Language('system', 'doesNotExist', 'Member', memberID));
        data[threadID].members[memberID].message[type] = 0;
        saveData(data);
        return callback(null, data);
    }

    function remove(threadID, callback) {
        if (!callback || !Function.isFunction(callback)) callback = utils.makeCallback();
        if (!utils.includes(threadID, 'String', 'Number')) return callback(Language('system', 'wrongType', 'threadID', 'String, Number'));
        if (!data[threadID]) return callback(Language('system', 'doesNotExist', 'Thread', threadID));
        delete data[threadID];
        saveData(data);
        return callback(data);
    }

    var has = (threadID) => !!data[threadID];
    var hasMember = (threadID, memberID) => !!data[threadID] && !!data[threadID].members[memberID];
    var antiRename = (threadID) => !!data[threadID] && !!data[threadID].antiRename;
    var antiChangesBotName = (threadID) => !!data[threadID] && !!data[threadID].antiChangesBotName;
    var isBanned = (threadID) => !!data[threadID] && !!data[threadID].banned;
    var totalThreads = (isGroup) => Object.keys(data).filter(threadID => !isGroup || isGroup && data[threadID].isGroup).length;
    var Threads = function(threadID, callback) {
        return get(threadID, callback);
    }

    return Object.assign(Threads, {
        get,
        getAllID,
        getKey,
        getMember,
        set,
        create,
        getInfo,
        addMember,
        increaseMsg,
        resetMsg,
        remove,
        has,
        hasMember,
        antiRename,
        antiChangesBotName,
        isBanned,
        totalThreads
    })
}