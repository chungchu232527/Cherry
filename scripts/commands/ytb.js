module.exports = class {
    constructor({ Language }) {
        this.name = 'ytb';
        this.author = {
            name: 'Henry',
            contact: 'Website: https://hoahenry.info'
        };
        this.description = Language(this.name, 'description');
        this.category = Language(this.name, 'category');
        this.guide = Language(this.name, 'guide');
        this.permission = 1;
        this.install = ['axios', 'ytdl-core'];
        this.countdown = 5;
    }
    init() {
        var { mkdirSync, existsSync } = require('fs');
        if (!existsSync(__dirname + '/cache')) mkdirSync(__dirname + '/cache');
    }
    async handleReply({ api, event, replyData, Language }) {
        var { threadID, messageID, body } = event, { type, data } = replyData, nameModule = this.name, { createReadStream, createWriteStream, statSync, unlinkSync } = require('fs'), ytdl = require('ytdl-core');
        if (!parseInt(body) || body <= 0) return api.sendMessage(Language(nameModule, 'isNotANumber'), threadID, messageID);
        var videoData = data[body - 1], filePath = __dirname + '/cache/' + messageID +  '.' + (type === 'audio' ? 'm4a' : 'mp4');
        return api.unsendMessage(replyData.messageID, function() {
            ytdl(videoData.videoID, {
                filter: type === 'audio' ? 'audioonly' : 'videoandaudio',
                quality: 'highest'
            })
            .pipe(createWriteStream(filePath))
            .on('close', function() {
                if (statSync(filePath).size > 26214400) return api.sendMessage(Language(nameModule, 'oversized'), threadID, messageID, () => unlinkSync(filePath));
                var msg = {
                    body: videoData.title,
                    attachments: createReadStream(filePath)
                }
                return api.sendMessage(msg, threadID, messageID, function(e, i) {
                    if (e) api.sendMessage(e, threadID, messageID);
                    return unlinkSync(filePath);
                });
            });
        });
    }
    async execute({ api, event, args, Task, Language, prefix, utils }) {
        var { threadID, messageID } = event, nameModule = this.name;
        if (!/video|audio|-v|-a/i.test(args[0])) return api.sendMessage(Language(nameModule, 'needFirstArguments', prefix, nameModule), threadID, messageID);
        var type = args.shift().replace(/-v/i, 'video').replace(/-a/i, 'audio'), maxSearchValue = parseInt(args[0]) && args[1] ? args.shift() : 5;
        return utils.searchYoutube(args.join(' '), maxSearchValue, function(error, data) {
            if (error) return api.sendMessage(error, threadID, messageID);
            var msg = data.map((video, index) => {
                return `${index + 1}. ${video.title}\n` +
                Language(nameModule, 'author', video.author.name) + '\n' +
                Language(nameModule, 'length', video.videoLength) + '\n' +
                Language(nameModule, 'view', video.viewCount) + '\n\n'
            });
            return api.sendMessage(Language(nameModule, 'sendSearchList', msg.join('')), threadID, (error, info) => {
                if (error) return api.sendMessage(error, threadID, messageID);
                Task.newReplyTask(info.messageID, nameModule, { type, data });
            })
        })
    }
}