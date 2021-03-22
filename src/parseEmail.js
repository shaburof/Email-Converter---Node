const fs = require('fs');
const path = require('path');
const simpleParser = require('mailparser').simpleParser;
const fsContent = require('./fsContent');

class parseEmail {
    constructor(email) {
        this.contents = fs.readFileSync(email, 'utf8');
        this.sendParams = {
            to: null,
            subject: null,
            html: null,
            attachments: [],
            text: null,
            textAsHtml: null,
            toWhitchAddressIsSent: null
        };
    }

    async getParams() {
        await this.parse();
        return this.sendParams;
    }

    parse() {
        return new Promise((resolv, reject) => {
            simpleParser(this.contents, {}, (err, parsed) => {
                try {
                    if (err) console.log(err);
                    else {
                        this.sendParams.toWhitchAddressIsSent = parsed.to.text;
                        this.messageId = parsed.messageId

                        this.sendParams.to = parsed.subject;
                        this.sendParams.subject = parsed.subject;
                        this.sendParams.html = 'body';
                        this.sendParams.from = parsed.from.value[0].address;
                        this.sendParams.messageId = this.messageId;

                        this.sendParams.attachments = parsed.attachments;

                        this.sendParams.text = parsed.text;
                        this.sendParams.textAsHtml = parsed.html;
                    }
                } catch (e) {
                    reject('parse with errors');
                }
                resolv(this.sendParams);
            });

        });
    }
}

module.exports = parseEmail;