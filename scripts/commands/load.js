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
    async execute({ api, event, Cherry, args, Language, utils, log, Users, Threads }) {
        var { threadID, messageID } = event, type = args.shift();
        switch (type) {
            case 'commands':
            case 'command':
            case '-c': {
                var { success, error, executeTime } = Cherry.loader('commands', false, args);
                return api.sendMessage(Language('system', 'completeLoading', success, success + error, executeTime), threadID, messageID);
            }
            case 'events':
            case 'event':
            case '-e': {
                var { success, error, executeTime } = Cherry.loader('events', false, args);
                return api.sendMessage(Language('system', 'completeLoading', success, success + error, executeTime), threadID, messageID);
            }
            case 'configs':
            case 'config':
            case '-cfg': {
                var { executeTime } = Cherry.loader('-cfg', false);
                return api.sendMessage(Language(this.name, 'reloadConfig', executeTime), threadID, messageID);
            }
            case 'all':
            case '-a':
            default: {
                var startLoading = Date.now();
                var { success, error, executeTime } = Cherry.loader('-a', false);
                return api.sendMessage(Language(this.name, 'reloadAll', success, success + error, (Date.now() - startLoading) + executeTime), threadID, messageID);
            }
        }
    }
}