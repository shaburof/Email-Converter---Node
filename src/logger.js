const timeHelper = require('./timeHelper');
const fs = require('fs');
const path = require('path');

class logger {

    constructor() {
        this.log = [];
        this.date = new timeHelper();
        this.fullFilePath = __dirname + path.sep + '..' + path.sep + 'logs' + path.sep + `${this.date.getDate()}.txt`;
    }

    add(logLine) {
        this.log.push(logLine);
    }

    build() {
        if (this.log.length === 0) return false;

        for (const logLine of this.log) {
            this.buildLogLine(logLine);
        }
    }

    buildLogLine(logString) {
        let stringToLog = `${this.date.getDateTime()} -> `;
        for (const item in logString) {
            if (item === 'messageId') { stringToLog += `${logString[item]} | `; continue; }
            stringToLog += `${item} : ${logString[item]} | `;
        }

        this.appendLineToLogFile(stringToLog.trim().replace(/ \|$/, ''));
    }


    appendLineToLogFile(string) {
        const lineBreak = '\r\n';
        fs.appendFileSync(this.fullFilePath, string + lineBreak);
    }

}

module.exports = logger;