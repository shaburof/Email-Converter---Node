class buildEmail {
    constructor() {
        this.to = '';
        this.from = '';
        this.subject = '';
        this.body = '';
        this.attach = [];
    }

    setTo(to) { this.to = to; }
    setFrom(from) { this.from = from; }
    setSubject(subject) { this.subject = subject; }
    setBody(body) { this.body = this.body + body + '<br>'; }
    setAttach(attach) {
        if (attach.length === 0) this.attach = []
        else {
            for (const file of attach) {
                if (file.convert !== true
                    && file.mime !== false
                    && file.isDirectory !== true
                    && file.archive !== true
                    && file.attachedEmail !== true
                ) this.attach.push({ filename: file.filename, path: file.path })
            }
        }
    }

    readyToSend(messageToSend) {
        return (this.body !== '') && (this.to !== '') && messageToSend.ready;
    }

    build() {
        return {
            to: this.to,
            from: this.from,
            subject: this.subject,
            body: this.body,
            attach: this.attach,
        }
    }
}

module.exports = buildEmail;