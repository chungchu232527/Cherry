module.exports = class {
    constructor({ Language }) {
        this.name = 'setname';
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
    async execute({ api, event, args }) {
        const { threadID, senderID, mentions, isGroup } = event;
        if (isGroup) {
            if (Object.keys(mentions).length === 0) {
                var name = args.join(" ");
                return api.changeNickname(name, threadID, senderID);
            }
            var nickname = args.join(' ');
            Object.values(mentions).forEach(item => nickname.replace(item, ''));
            for (let ID of Object.keys(mentions)) api.changeNickname(nickname, threadID, ID);
        } else {
            if (args[0] && /me/i.test(args[0])) {
                args.shift();
                var nickname = args.join(' ');
                return api.changeNickname(name, threadID, senderID);
            } else {
                var userID = senderID === api.currentID ? threadID : senderID;
                return api.changeNickname(args.join(' '), threadID, userID);
            }
        }
    }
}