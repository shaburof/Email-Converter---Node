const allowMime = require('./allowMime');

class mimeCheck {

    async check(file) {
        const message = {};

        const type = await this.getType(file);
        message.type = type;

        return new Promise((resolve, reject) => {
            // const type = 'one'; // получаем через mmmagic npm
            resolve(this.checkInArrayOfAllowTypes(type));
        });
    }

    getType(file) {
        return new Promise((resolve, reject) => {
            resolve('one');
        });
    }

    checkInArrayOfAllowTypes(type) {
        let message = { status: false, type: type, convert: false };

        for (const item of allowMime) {
            if (item.type === type) {
                message = { ...message, status: true, ...item }
                break;
            }
        }

        return message;
    }

}

module.exports = mimeCheck;