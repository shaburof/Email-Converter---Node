const nodemailer = require("nodemailer");

class sendEmail {
    constructor(log, buildEmail) {
        this.log = log;
        this.buildEmail = buildEmail;

        this.transporter = nodemailer.createTransport({
            host: "192.168.0.230",
            port: 465,
            secure: true,
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    setParams(params) {
        this.to = params.to;
        this.subject = params.subject;
        this.body = params.body ? params.body : '';
        this.attach = params.attach ? params.attach : null;
        this.from = params.from ? params.from : null;
    }

    quickSend(params, action = true) {
        this.to = params.to;
        this.subject = params.subject;
        this.body = params.body ? params.body : '';
        this.attach = params.attach ? params.attach : null;
        this.from = params.from ? params.from : null;

        this.send(action);
    }



    async sending() {
        const info = await this.transporter.sendMail({
            from: "isdoc@bank.bank",
            to: this.to,
            subject: this.subject,
            html: this.body,
            attachments: this.attach
        });

        console.log("MEssage ID", info.messageId);
    }

    async send(action = true) {
        if (!action) { console.log('send email'); return false; }
        await this.sending().catch((err) => {
            const message = typeof this.to !== 'undefined'
                ? `письмо от: ${this.from}, в теме письма указан недопустимый адрес "${this.to}"`
                : `письмо от: ${this.from}, в теме не указан обратный адрес`;
            this.log.add({ address: message });

            this.buildEmail.setTo(this.from);
            this.buildEmail.setBody(message);
            this.buildEmail.setAttach([]);

            throw new Error(`адрес "${this.subject}" указан неверно`);
        })
    }
}

module.exports = sendEmail;