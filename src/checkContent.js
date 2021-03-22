const mimeCheck = require('./mimeCheck');
const allowMime = require('./allowMime');
const convert = require('./convert');
const allowedAddresses = require('./allowFromEmail');
const handleAttachedEmail = require('./handleAttachedEmail');


class checkContent {

    constructor(log, buildEmail) {
        this.mime = new mimeCheck();
        this.log = log;
        this.buildEmail = buildEmail;
        this.Convert = new convert();
        this.handleAttachedEmail = new handleAttachedEmail();
    }

    checkToWhitchAddressIsSent(params) {
        const status = { error: false, message: null };
        const address = params.toWhitchAddressIsSent;
        if (allowedAddresses[address] === undefined) {
            status.error = true;
            status.message = `письмо отправлено на некорректный адрес: "${address}"`;
        }

        return status;
    }

    checkFromAddressIsAllowed(params) {
        // проверяем что для адреса куда отправляется почта isdoc@bank.bank  разрешено отправка сообщений с адресов по маске из файла allowFromEmail
        const allowRule = allowedAddresses['isdoc@bank.bank'];
        const status = { error: false, message: null };

        if (!allowRule.test(params.from)) {
            status.error = true;
            status.message = `прием только с адресов "*_isfront@bank.bank"`;
        }

        return status;
    }

    checkSubjectAsAddressToSend(params) {
        const status = { error: false, message: null };

        if (typeof params.subject === 'undefined') {
            status.message = `письмо от: ${params.from}, в теме не указан обратный адрес`;
            status.error = true;
        }
        else if (!/[a-z0-9]+@bank\.bank/gi.test(params.subject)) {
            status.message = `письмо от: ${params.from}, указанный для отправки адрес: "${params.subject}" не является корректным`;
            status.error = true;
        }

        return status;
    }

    checkAttach(attachments) {
        const status = { error: false, message: null };
        if (attachments.length === 0) {
            status.error = true;
            status.message = this.buildEmail.from ? `письмо от: ${this.buildEmail.from}, отсутствуют файлы для отправки` : `отсутствуют файлы для отправки`;
        };

        return status;
    }

    removeUnnecessaryAttachments(params) {
        const validatedAttachment = [];
        for (const _attach in params.attachments) {
            const attach = params.attachments[_attach];
            if (attach.contentDisposition === 'attachment') {
                validatedAttachment.push(attach);
            }
        }
        params.attachments = validatedAttachment;
        return params;
    }

    extensionFix = (files) => {
        const fixedFiles = [];
        for (const file of files) {
            const extension = file.extension;
            const filename = file.filename;
            if (filename.endsWith(extension) || !extension) fixedFiles.push(file);
            else {
                this.log.add({ fixExtension: `письмо от: ${this.buildEmail.from}, некорректное расширение в файле  "${filename}", замена на "${extension}"` });
                fixedFiles.push({ ...file, filename: `${filename}.${extension}` });
            }
        }

        return fixedFiles;
    }


    async validateMimeType(files, messageId, messageToSend, secondCheck = false) {
        const validateFiles = []
        let mimeType = null;
        for (const file of files) {
            const fileName = file.filename;
            const filePath = file.path;

            mimeType = await this.mime.check(filePath);

            let condition = mimeType.status;
            if (mimeType.archive && secondCheck && typeof file.archive === 'undefined') condition = false;

            if (condition) {
                file.convert = mimeType.convert;
                messageToSend.ready = true;
                if (mimeType.archive) {
                    file.archive = true;
                }
            } else {
                if (mimeType.type !== 'message/rfc822' && !file.isDirectory && (typeof file.mime === 'undefined')) {
                    this.log.add({ mimeValidation: `письмо от: ${this.buildEmail.from}, "${mimeType.type}" недопустимый формат файла "${fileName}"` });
                    this.buildEmail.setBody(`"<span color='red'>${mimeType.type}</span>" недопустимый формат для файла: ${fileName}`);
                    file.mime = false;
                }
            }
            validateFiles.push(file);
        }

        return validateFiles;
    }

    async convertAllowedFiles(files, messageId) {
        const arrayWithConvertedFiels = [];
        for (const file of files) {
            if (file.convert) {
                const convertedFile = await this.Convert.go(file);
                if (convertedFile.status) arrayWithConvertedFiels.push(convertedFile);
                else {
                    this.log.add({ messageId: messageId, convert: `не удалось конвертировать файл ${file.filename}` });
                }
            }
            arrayWithConvertedFiels.push(file);
        }

        return arrayWithConvertedFiels;
    }

    async handledAttachedEmaild(main, from, to, files, messageToSend) {
        const arr = [];
        for (const file of files) {
            if (file.attachedEmail) {
                const fileObject = this.handleAttachedEmail.handle(file, from, to);
                arr.push(fileObject);
                await main(fileObject.path);
            }
            else {
                arr.push(file);
                messageToSend.ready = true;
            }
        }
        return files;
    }

}

module.exports = checkContent;