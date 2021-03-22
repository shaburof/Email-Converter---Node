class constructEmail {
    setEmailParameters(params) {
        this.address = address;
    }

    addAttachment(attachment) {
        this.attachment = attachment;
    }

    getSendEmailParameters() {
        return {
            address: this.address,
            attachment: this.attachment,
        }
    }
}

module.exports = constructEmail;