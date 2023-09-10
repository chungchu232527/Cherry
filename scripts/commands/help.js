module.exports = class {
    constructor({ Language }) {
        this.name = 'help';
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
    async registerEvent({ Cherry, api, event, Threads, Language, utils }) {
        var { threadID, messageID, body } = event;
        if (/^help/i.test(body)) {
            var { commands } = Cherry, splitBody = body.split(' ');
            if (splitBody.length > 1 && commands.has(splitBody[1])) {
                let command = commands.get(splitBody[1]), { prefix } = await Threads.get(threadID) || Cherry.configs, author = Language('help', 'author') + command.author.name + '\n' + command.author.contact;
                let guide = command.guide.join('\n') || Language(this.name, 'notFoundGuides');
                let allKeys = Array.from(Cherry.commands.keys());
                guide = guide.replace(/<p>/g, prefix + command.name).replace(/<ex>/g, Language(this.name, 'example', prefix + command.name)).replace(/<randomCmd>/g, allKeys[Math.floor(Math.random() * allKeys.length)]);
                let description = command.description || Language(this.name, 'notFoundDescription');
                return api.sendMessage(Language(this.name, 'commandInfo', command.name, description, command.countdown, Language(this.name, 'permissions')[command.permission], guide + '\n\n' + author), threadID, messageID, utils.autoUnsend(120000));
            }
        }
        if (/^prefix/i.test(body)) {
            var { prefix: threadPrefix } = await Threads.get(threadID), { prefix } = Cherry.configs;
            return api.sendMessage(Language(this.name, 'viewPrefix', threadPrefix || Language(this.name, 'unknowPrefix'), prefix), threadID, messageID);
        }
    }
    async execute({ api, event, Cherry, args, prefix, Language, utils }) {
        var { threadID, messageID } = event, { commands } = Cherry;
        var command = commands.get(args[0] || '');
        if (!command || !args[0]) {
            var pageNumber = args[0] - 1 || 0, nameModule = this.name;
            var numberOfPage = pageNumber + 1, page = [], inforCommands = [], totalCommands = 0, number = 1;
            commands.forEach((value, key) => {
                if (!value.hide) {
                    let description = value.description || Language(nameModule, 'notFoundDescription');
                    // let group = value.group || Language(nameModule, 'default');
                    inforCommands.push(Language(nameModule, 'commandInPage', number++, key, description, number % 20 === 0 || number - 1 === commands.size ? '\n' : '\n\n'));
                    totalCommands++;
                }
                if (inforCommands.length == 20) {
                    page.push(inforCommands);
                    inforCommands = [];
                }
            })
            page.push(inforCommands);
            var pageRequire = page[pageNumber], number = 20 * numberOfPage - 20 + 1;
            if (!pageRequire || pageRequire.length === 0) return api.sendMessage(Language(nameModule, 'emptyPage'), threadID, messageID);
            return api.sendMessage(Language(nameModule, 'Cherry') + pageRequire.join(' ') + Language(nameModule, 'footerPage', Language(nameModule, 'Cherry'), pageNumber + 1, Math.ceil((page.length * 20) / 20), totalCommands, prefix), threadID, messageID, utils.autoUnsend(120000));
        }
        var author = Language('help', 'author') + command.author.name + '\n' + command.author.contact;
        let guide = command.guide.join('\n') || Language(this.name, 'notFoundGuides');
        let allKeys = Array.from(Cherry.commands.keys());
        guide = guide.replace(/<p>/g, prefix + command.name).replace(/<ex>/g, Language(this.name, 'example', prefix + command.name)).replace(/<randomCmd>/g, allKeys[Math.floor(Math.random() * allKeys.length)]);
        let description = command.description || Language(this.name, 'notFoundDescription');
        return api.sendMessage(Language(this.name, 'commandInfo', command.name, description, command.countdown, Language(this.name, 'permissions')[command.permission - 1], guide + '\n\n' + author), threadID, messageID);
    }
}