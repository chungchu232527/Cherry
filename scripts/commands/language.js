module.exports = class {
    constructor({ Language }) {
        this.name = 'language';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.permission = 3;
        this.countdown = 5;
    }
    async handleReaction({ api, event, reactionData, Cherry, Language, utils }) {
        var { threadID, userID } = event, { author, selection } = reactionData, nameModule = this.name;
        if (userID == author) {
            return api.unsendMessage(reactionData.messageID, async function () {
                await Language.setLanguage(selection);
                Cherry.configs.language = selection;
                await Cherry.saveConfigs();
                await Cherry.loader('-a', false, null);
                return api.sendMessage(Language(nameModule, 'success', utils.formatRegionToLanguageName(selection)), threadID);
            });
        }
    }
    async handleReply({ api, event, replyData, Language, Task, utils }) {
        var { threadID, messageID, senderID, body } = event, { allLanguageAvaiable, author } = replyData, nameModule = this.name;
        if (senderID != author) return api.sendMessage(Language(nameModule, 'isAuthor'), threadID, messageID);
        if (!parseInt(body)) return api.sendMessage(Language(nameModule, 'isNumber'), threadID, messageID);
        if (body > allLanguageAvaiable.length) return api.sendMessage(Language(nameModule, 'notInTheList'), threadID, messageID);
        return api.unsendMessage(replyData.messageID, async function () {
            return api.sendMessage(Language(nameModule, 'accept', utils.formatRegionToLanguageName(allLanguageAvaiable[body - 1])), threadID, messageID, (err, info) => {
                Task.newReactionTask(info.messageID, nameModule, {
                    author: author,
                    selection: allLanguageAvaiable[body - 1]
                });
            });
        });
    }
    async execute({ api, args, event, Language, Task, utils }) {
        var { readdirSync } = require('fs');
        var { threadID, messageID, senderID, timestamp } = event, nameModule = this.name;
        if (/-r|-rl|-reload/i.test(args[0])) {
            await Language.setLanguage(Language.getLocale());
            return api.sendMessage(Language(nameModule, 'reload', Date.now() - timestamp), threadID, messageID);
        }
        var allLanguageAvaiable = readdirSync(process.cwd() + '/system/language/').filter(n => n.endsWith('.json')).map(n => n.replace('.json', ''));
        var msg = allLanguageAvaiable.map((n, i) => i + 1 + '. ' + n + ': ' + utils.formatRegionToLanguageName(n));
        return api.sendMessage(Language(nameModule, 'select', msg.join('\n') + '\n'), threadID, messageID, (err, info) => {
            Task.newReplyTask(info.messageID, nameModule, {
                author: senderID,
                allLanguageAvaiable
            });
        })
    }
}