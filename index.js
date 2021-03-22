console.clear();
console.log('-----------------------------------');
const fs = require('fs');
const path = require('path');

const parseEmail = require('./src/parseEmail');
const sendEmail = require('./src/sendEmail');
const fsContent = require('./src/fsContent');
const checkContent = require('./src/checkContent.js');
const _buildEmail = require('./src/buildEmail');
const logger = require('./src/logger');
const unpack = require('./src/unpack');

const debug = true;

const main = async (email) => {
    const log = new logger();
    const buildEmail = new _buildEmail();
    const checkC = new checkContent(log, buildEmail);
    const se = new sendEmail(log, buildEmail);
    const fileDataContent = new fsContent(log);
    const Unpack = new unpack();

    let attachedFiles = null;
    let attachedFilesAfterValidateMimeType = null;
    let attachedConvertedFiles = null;
    let attachedFilesUnpackHandle = null;
    let unpackFilesMimeCheck = null;
    let handledAttachedEmails = null;
    let fixExtensionFiles = null;

    const messageToSend = { ready: false };
    const whitchIsSent = { address: null };


    // buildEmail.setTo('');
    buildEmail.setTo('');
    buildEmail.setSubject('isFront доставка');
    buildEmail.setAttach([]);

    try {

        const pe = new parseEmail(email);
        let params = await pe.getParams();

        params = checkC.removeUnnecessaryAttachments(params);

        buildEmail.setTo(params.to);                // for sending error message
        buildEmail.setFrom(params.from);            // for logging
        whitchIsSent.address = params.toWhitchAddressIsSent;    // for creating transport for send message, different transports for different addresses from message came from

        const errors = [
            //() => checkC.checkFromAddressIsAllowed(params),
            () => checkC.checkToWhitchAddressIsSent(params),
            () => checkC.checkSubjectAsAddressToSend(params),
            () => checkC.checkAttach(params.attachments)
        ];
        for (const errResult of errors) {
            const error = errResult();
            if (error.error) {
                buildEmail.setTo(params.from);
                buildEmail.setBody(error.message);
                log.add({ status: error.message });
                messageToSend.ready = true;
                throw new Error(error.message);
            }
        }


        fileDataContent.prepareContent(params);

        attachedFiles = fileDataContent.save();
        attachedFiles = await checkC.handledAttachedEmaild(main, params.from, params.to, attachedFiles, messageToSend);
        attachedFilesAfterValidateMimeType = await checkC.validateMimeType(attachedFiles, params.messageId, messageToSend);
        attachedFilesUnpackHandle = await Unpack.go(attachedFilesAfterValidateMimeType);
        unpackFilesMimeCheck = await checkC.validateMimeType(attachedFilesUnpackHandle, params.messageId, messageToSend);

        attachedConvertedFiles = await checkC.convertAllowedFiles(unpackFilesMimeCheck, params.messageId);
        fixExtensionFiles = checkC.extensionFix(attachedConvertedFiles);

        buildEmail.setTo(params.subject);
        buildEmail.setAttach(fixExtensionFiles);
        buildEmail.setFrom(params.from);
        buildEmail.setBody(params.textAsHtml);

        se.setParams(buildEmail.build());
        if (buildEmail.readyToSend(messageToSend)) await se.send(!debug);
        else {
            log.add({ checkAttachBeforeSend: `сообщение от: ${params.from}, после фильтрации не осталось вложений для отправки` })
        }
        !debug && fileDataContent.clearFiles(email, fixExtensionFiles);
        log.build();

    } catch (e) {
        if (buildEmail.readyToSend(messageToSend)) se.quickSend(buildEmail.build(), !debug);

        log.build();
        console.log(e);
        console.log('записать ошибку в лог 1');
        !debug && fileDataContent.clearFiles(email, fixExtensionFiles);
    }

}

const emailsPath = `${__dirname}${path.sep}emails${path.sep}`;
const emailsTmpPath = `${__dirname}${path.sep}emailsTmp${path.sep}`;

// move file to tmp dir
fs.readdirSync(emailsPath).forEach(email => {
    fs.renameSync(emailsPath + email, emailsTmpPath + email);
});

// send emails
fs.readdirSync(emailsTmpPath).forEach(email => {
    main(emailsTmpPath + email);
});

