module.exports = class {
    constructor({ Language }) {
        this.name = 'testmode';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.permission = 3;
        this.countdown = 10;
    }
    async execute({ Cherry, Language, api, event }) {
        var { threadID, messageID } = event;
        Cherry.configs.testMode = !Cherry.configs.testMode;
        Cherry.saveConfigs();
        return api.sendMessage(Language(this.name, Cherry.configs.testMode ? 'enabled' : 'disabled'), threadID, messageID);
    }
}