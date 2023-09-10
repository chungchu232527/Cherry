module.exports = class {
    constructor({ Language }) {
        this.name = 'example';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.install = ["axios", "request"];
        this.eventType = ['log:user-nickname', 'log:thread-name']
        this.permission = 1;
        this.countdown = 20;
    }
    async init({ Cherry, Language, utils, log }) {
        //
    }
    async execute({ Cherry, Language, api, utils, log, args, event, Users, Threads, callerPermission, prefix, Task }) {
        //
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