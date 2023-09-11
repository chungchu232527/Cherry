module.exports = class {
    constructor({ Language }) {
        this.name = 'info';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.permission = 1;
        this.countdown = 5;
    }
    async execute({ api, args, event, Cherry, Threads, Users, Language, utils }) {
        var { threadID, senderID, messageID, mentions, timestamp } = event, msg = '';
        switch (args[0]) {
            case 'user':
            case '-u': {
                if (Object.keys(mentions).length > 0) {
                    var data = await Users.get(Object.keys(mentions));
                    for (let [ID, info] of Object.entries(data)) {
                        var { name, sex, dating, facebookID } = info;
                        msg += Language(this.name, 'userTemplate', name, sex, Language(this.name, dating ? 'dating' : 'alone'), facebookID);
                    }
                } else {
                    var { name, sex, dating, facebookID } = await Users.get(senderID);
                    msg += Language(this.name, 'userTemplate', name, sex, Language(this.name, dating ? 'dating' : 'alone'), facebookID);
                }
                return api.sendMessage(msg, threadID, messageID);
            }
            case 'thread':
            case '-t': {
                if (args[1] == 'all') {
                    var allThreads = await Threads.getKey(['name', 'emoji', 'members', 'totalMsg', 'adminIDs', 'createTime', 'isGroup', 'inviteLink']);
                    for (let [ID, info] of Object.entries(allThreads)) {
                        if (info.isGroup) {
                            var { participantIDs } = await Threads.getInfo(ID);
                            var createTime = utils.getTimeFromTimestamp(info.createTime).timeString;
                            msg += Language(this.name, 'threadTemplate', info.name || ID, info.emoji || Language(this.name, 'default'), Object.keys(info.members).length, participantIDs.length, info.totalMsg, info.adminIDs.length, info?.inviteLink?.enable ? info.inviteLink.link : Language(this.name, 'disable'), createTime);
                        }
                    }
                } else {
                    var thread = await Threads.get(threadID), { participantIDs } = await Threads.getInfo(threadID);
                    var createTime = utils.getTimeFromTimestamp(thread.createTime).timeString;
                    msg += Language(this.name, 'threadTemplate', thread.name || threadID, thread.emoji || Language(this.name, 'default'), Object.keys(thread.members).length, participantIDs.length, thread.totalMsg, thread.adminIDs.length, info?.inviteLink?.enable ? info.inviteLink.link : Language(this.name, 'disable'), createTime);
                }
                return api.sendMessage(msg, threadID, messageID);
            }
            default: {
                var nameModule = this.name;
                var thread = await Threads.get(threadID);
                var threadPrefix = thread.prefix || Language(this.name, 'unknow');
                var { configs, timeStart } = Cherry;
                var info = utils.getSystemInformation(nameModule, Language);
                msg += Language(this.name, 'Cherry', utils.getTimeFromTimestamp(timeStart).timeString, utils.calcTimeElapsed(timeStart, Date.now()).timeString, Threads.totalThreads(true), Users.totalUsers(), Cherry.commands.size, configs.prefix, threadPrefix, info || '', Language.getLanguageInformations().languageAvailable, Date.now() - timestamp);
                return api.sendMessage(msg, threadID, messageID);
            }
        }
    }
}