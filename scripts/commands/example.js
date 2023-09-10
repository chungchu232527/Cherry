module.exports = class {
    constructor({ Language }) {
        this.name = 'example';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.install = ["axios", "request"];
        this.permission = 1, 2, 3;
        this.countdown = 20;
    }
    async init({ Cherry, Language, utils, log }) {
        //
    }
    async execute({ Cherry, Language, api, utils, log, args, event, Users, Threads, callerPermission, prefix, Task }) {
        var { messageID } = event, commandName = this.name;
        Task.newReplyTask(messageID, commandName, data = {}); // New Reply Task
        Task.newReactionTask(messageID, commandName, data = {}); // New Reaction Task
        Task.removeReplyTask(messageID); // Remove Reply Task
        Task.removeReactionTask(messageID); // Remove Reaction Task
    }
    async handleReply({ Cherry, Language, Users, Threads, Task, event, api, replyData, utils, log }) {
        //
    }
    async handleReaction({ Cherry, Language, Users, Threads, Task, event, api, reactionData, utils, log }) {
        //
    }
    async registerEvent({ Cherry, Language, Users, Threads, Task, event, api, utils, log }) {
        //
    }
}