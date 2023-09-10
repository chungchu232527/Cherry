module.exports = class {
    constructor({ Language }) {
        this.name = 'admin';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.permission = 1;
        this.countdown = 10;
    }
    async handleReply({ api, event, Cherry, replyData, Language }) {
        var { threadID, messageID, senderID, body } = event, { admin, author, messageID: _ } = replyData, nameModule = this.name;
        if (author !== senderID) return api.sendMessage(Language(this.name, 'notTheAuthor'), threadID, messageID);
        var choose = body.split(' ').filter(item => parseInt(item) && item <= admin.length);
        var removeIDs = choose.map((v) => {
            return admin[v - 1];
        })
        if (removeIDs.length == 0) return api.sendMessage(Language(nameModule, 'notFoundItem'), threadID, messageID);
        return api.unsendMessage(_, function() {
            Cherry.configs.admin = admin.filter(item => !removeIDs.includes(item));
            Cherry.saveConfigs();
            return api.sendMessage(Language(nameModule, 'removed'), threadID, messageID);
        });
    }
    async execute({ api, args, event, Cherry, Users, Language, Task, prefix, callerPermission }) {
        var { threadID, messageID, mentions, senderID } = event, type = args.shift(), { admin } = Cherry.configs, nameModule = this.name;
        if (/list/i.test(type)) {
            let msg = admin.map((v, i) => {
                return Users.get(v, (err, data) => {
                    if (err) return err;
                    return `${i + 1}. ${data.name}`;
                })
            });
            return api.sendMessage(Language(nameModule, 'list', msg.join('\n')), threadID, messageID);
        }
        if (/add/i.test(type) && (callerPermission === 3 || admin.length === 0)) {
            var ids = Object.keys(mentions).length > 0 ? Object.keys(mentions) : args.length > 0 ? args : '';
            if (!ids) return api.sendMessage(Language(nameModule, 'error', prefix, nameModule), threadID, messageID);
            Cherry.configs.admin = Cherry.configs.admin.concat(ids);
            Cherry.saveConfigs();
            return api.sendMessage(Language(nameModule, 'added'), threadID, messageID);
        }
        if (/remove/i.test(type) && callerPermission === 3) {
            var ids = Object.keys(mentions).length > 0 ? Object.keys(mentions) : args.length > 0 ? args : '';
            if (!ids) {
                let msg = admin.map((v, i) => {
                    return Users.get(v, (err, data) => {
                        if (err) return err;
                        return `${i + 1}. ${data.name}`;
                    })
                });
                return api.sendMessage(Language(nameModule, 'removeList', msg.join('\n')), threadID, messageID, function(e, i) {
                    Task.newReplyTask(i.messageID, nameModule, { admin, author: senderID });
                });
            } else {
                Cherry.configs.admin = admin.filter(item => !item.includes(ids));
                Cherry.saveConfigs();
                return api.sendMessage(Language(nameModule, 'removed'), threadID, messageID);
            }
        }
    }
}