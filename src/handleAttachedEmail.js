const fs = require('fs');
const path = require('path');

class handleAttachedEmail {
    constructor() {
        this.filename = null;
        this.path = null;
        this.folderPath = `${__dirname + path.sep}..${path.sep}files${path.sep}`;
        this.from = null;
        this.to = null;

        this.tests = [];

        this.messageStringArray = null;
        this.changedEmail = '';
    }
    //     {
    //     filename: 'attachedemail',
    //         path: 'D:\\PROFILE\\domains\\isDoc\\src\\..\\files\\19674attachedemail',
    //             attachedEmail: true
    // },
    init(attachedEmail, from, to) {
        this.messageStringArray = [];
        this.changedEmail = '';
        this.filename = attachedEmail.filename;
        this.path = attachedEmail.path

        this.from = from;
        this.to = to;
        this.tests = [
            { testString: /^From:/, string: `From: <${from}>` },
            { testString: /^To:/, string: 'To: <isdoc@bank.bank>' },
            { testString: /^Subject:/, string: `Subject: <${to}>` },
        ];
    }
    handle(attachedEmail, from, to) {
        if (!attachedEmail.attachedEmail) return attachedEmail;

        this.init(attachedEmail, from, to);
        try {

            this.readEmail();
            this.convertEmailToString();
            this.saveChangedEmail();
            return this.getNewFileName();
        } catch (err) {
            console.log('error in handle method');
            console.log(err);
        }
    }

    getNewFileName() {
        const newName = this.filename + '_changed';
        return { filename: newName, path: this.folderPath + newName };
    }

    readEmail() {
        try {
            const data = fs.readFileSync(this.path, 'UTF-8');
            const lines = data.split(/\r?\n/);

            let process = true;
            for (const line of lines) {
                let newLine = line;
                if (process) {
                    for (const reg of this.tests) {
                        if (reg.testString.test(line)) newLine = reg.string;
                    }
                }

                this.messageStringArray.push(newLine);
                if (process && /^Message-ID:/.test(line)) process = false;
            }
        } catch (err) {
            console.log('log error can not read file');
            console.error(err);
            throw new Error('log error can not read file');
        }
    }

    convertEmailToString() {
        this.changedEmail = this.messageStringArray.join("\r\n");
    }

    saveChangedEmail() {
        const { filename, path } = this.getNewFileName();
        try {
            fs.writeFileSync(this.folderPath + filename, this.changedEmail);
        } catch (err) {
            console.log('add to log, can not save to file');
            console.log(err);
            throw new Error('add to log, can not save to file');
        }
    }



}

module.exports = handleAttachedEmail;