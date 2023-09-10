var reader = require('readline-sync');
var sha256 = require('./tools/sha256');
var aesjs = require('./tools/aes');
var cheerio = require('cheerio');
var axios = require('axios');

function makeCallback() {
    return async function callback(error, data) {
        return new Promise(function (resolve, reject) {
            return error ? reject(error) : resolve(data);
        });
    }
}

function includes(data, ...type) {
    return type.includes(Object.prototype.toString.call(data).slice(8, -1));
}

function readLine(question, nullAnswer, clearLog) {
    let answer = reader.question(question, { encoding: 'utf-8' });
    if (clearLog) process.stdout.write("\u001b[0J\u001b[1J\u001b[2J\u001b[0;0H\u001b[0;0W");
    return !nullAnswer || answer.length > 0 ? answer : readLine(question, nullAnswer);
}

function formatRegionToLanguageName(region) {
    var regionNameMap = {
        vi_VN: "Tiếng Việt",
        en_US: "English"
    };
    return regionNameMap[region];
}

function decrypt(key, data) {
    const keyHash = [...sha256(key || "").match(/.{2}/g)].map(e => parseInt(e, 16));
    const bytes = aesjs.utils.hex.toBytes(data);
    const aesCtr = new aesjs.ModeOfOperation.ctr(keyHash);
    const decryptedData = aesCtr.decrypt(bytes);
    return aesjs.utils.utf8.fromBytes(decryptedData);
}

function encrypt(key, data) {
    if (!key || key === '') return data;
    let keyHash = [...sha256(key || "").match(/.{2}/g)].map(e => parseInt(e, 16));
    let bytes = aesjs.utils.utf8.toBytes(JSON.stringify(data, null, 4));
    let aesCtr = new aesjs.ModeOfOperation.ctr(keyHash);
    let encryptedData = aesCtr.encrypt(bytes);
    return aesjs.utils.hex.fromBytes(encryptedData);
}

function getTimeFromTimestamp(timestamp) {
    const date = new Date(parseInt(timestamp));
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString()}`;
  
    return {
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        timeString
    };
}

function calcByte(byte) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0, usage = parseInt(byte, 10) || 0;
    while(usage >= 1024 && ++i) usage = usage/1024;
    return (usage.toFixed(usage < 10 && i > 0 ? 1 : 0) + ' ' + units[i]);
}

async function searchYoutube(query, maxSearchValue = 5, callback) {
    if (!callback || !Function.isFunction(callback)) callback = makeCallback();
    var { data } = await axios('https://m.youtube.com/results?search_query=' + encodeURIComponent(query));
    var $ = cheerio.load(data);
    var ytInitialData = $('script').filter((i, s) => $(s).text().includes('var ytInitialData')).first().text().replace('var ytInitialData = ', '').slice(0, -1);
    var results = getYoutubeVideoInformation(JSON.parse(ytInitialData));
    return callback(null, results.slice(0, maxSearchValue));
}

function getYoutubeVideoInformation(results) {
    try {
        var { contents } = results.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents.filter(item => item.itemSectionRenderer).shift().itemSectionRenderer;
        return contents.filter(item => item.videoRenderer && item.videoRenderer.videoId).map(function(item) {
            return {
                videoID: item.videoRenderer.videoId,
                videoURL: 'https://www.youtube.com/watch?v=' + item.videoRenderer.videoId,
                title: item.videoRenderer.title.runs[0].text,
                author: {
                    name: item.videoRenderer.longBylineText.runs[0].text,
                    url: item.videoRenderer.longBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url
                },
                publishedTime: item.videoRenderer.publishedTimeText ? item.videoRenderer.publishedTimeText.simpleText : null,
                videoLength: item.videoRenderer.lengthText.accessibility.accessibilityData.label,
                viewCount: item.videoRenderer.viewCountText.simpleText,
                thumbnail: item.videoRenderer.thumbnail.thumbnails
            }
        });
    } catch (error) {
        return console.log(error);
    }
}

function addUtils({ Language, api }) {
    function makeTypingAndSendMessage(message, isGroup, threadID, messageID) {
        return api.sendTyping(threadID, isGroup, function(error, removeTyping) {
            if (error) return error;
            return api.sendMessage(message, threadID, messageID, function(error) {
                if (error) return error;
                return removeTyping();
            })
        })
    }

    function autoUnsend(after) {
        return function(error, info) {
            if (!error) return setTimeout(() => api.unsendMessage(info.messageID), after);
        }
    }

    function getSystemInformation(nameModule, Language) {
        var os = require("os");
        var { speed, model } = os.cpus().shift();
        if (speed && model) return Language(nameModule, 'os', os.hostname, model, speed, calcByte(os.totalmem()), `${calcByte(os.freemem())} (${(os.freemem() * 100 / os.totalmem()).toFixed()}%)`);
    }
    
    function calcTimeElapsed(startTime, endTime) {
        const timeDiff = Math.abs(endTime - startTime);
        const milliseconds = timeDiff % 1000;
        const seconds = Math.floor(timeDiff / 1000) % 60;
        const minutes = Math.floor(timeDiff / (1000 * 60)) % 60;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60)) % 24;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) % 30;
        const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30)) % 12;
        const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30 * 12));
        var timeString = Language('system', 'calcTimeString', years, months, days, hours, minutes, seconds, milliseconds).split(' ');
        timeString = timeString.filter((item, index) => parseInt(item) || parseInt(timeString[index - 1])).join(' ');
        
        return {
            years,
            months,
            days,
            hours,
            minutes,
            seconds,
            milliseconds,
            timeString
        };
    }

    return {
        autoUnsend,
        calcTimeElapsed,
        getSystemInformation,
        makeTypingAndSendMessage,
    }
}

module.exports = {
    encrypt,
    decrypt,
    addUtils,
    calcByte,
    includes,
    readLine,
    makeCallback,
    searchYoutube,
    getTimeFromTimestamp,
    formatRegionToLanguageName,
}