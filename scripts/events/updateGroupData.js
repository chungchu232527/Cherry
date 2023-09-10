module.exports = class {
    constructor() {
        this.name = 'example';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.eventType = ['change_thread_admins']
        this.permission = 1;
        this.countdown = 20;
    }
    async execute({ Language, api, event, Threads }) {
        var { logMessageData, threadID } = event;
        var threadInfo = await Threads(threadID);
        if (logMessageData.ADMIN_EVENT == 'add_admin') {
            threadInfo.adminIDs.push({ id: logMessageData.TARGET_ID });
            await Threads.set(threadID, threadInfo);
        }
        if (logMessageData.ADMIN_EVENT == 'remove_admin') {
            threadInfo.adminIDs = threadInfo.adminIDs.filter(item => item.id !== logMessageData.TARGET_ID);
            await Threads.set(threadID, threadInfo);
        }
        return api.sendMessage(Language(this.name, 'refreshed'), threadID);
    }
}