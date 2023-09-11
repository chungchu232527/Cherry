module.exports = class {
    constructor({ Language }) {
        this.name = 'load';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.permission = 2;
        this.countdown = 5;
    }
    async execute({ api, event, Cherry, args, Language }) {
        var { threadID, messageID } = event, type = args.shift(), startLoading = Date.now();
        var langType = /commands?|-c|events?|-e/g.test(type) ? 'completeLoading' : /configs?|-cfg|/g.test(type) ? 'reloadConfig' : 'reloadAll', region = /commands?|-c|events?|-e/g.test(type) ? 'system' : this.name;
        var { success, error, executeTime } = Cherry.loader(type, false, args);
        var msg = langType === 'reloadConfig' ? Language(region, langType, executeTime) : Language(region, langType, success, success + error, (Date.now() - startLoading) + executeTime);
        return api.sendMessage(msg, threadID, messageID);
    }
}