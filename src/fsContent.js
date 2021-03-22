const fs = require('fs');
const path = require('path');

class saveContent {
    constructor(log) {
        this.log = log;
    }

    prepareContent(parse) {
        this.contents = parse.attachments;
        this.messageId = parse.messageId;

        this.attachments = [];
        this.pathToFiles = __dirname + path.sep + '..' + path.sep + 'files' + path.sep;
    }

    getFilename(filename) {
        return this.filePath = this.pathToFiles + this.randomInteger() + filename;
    }

    save() {
        for (const item of this.contents) {
            const fileName = !item.filename && item.contentType === 'message/rfc822' ? this.randomInteger() + 'attachedemail' : item.filename;
            const content = item.content;

            const filePath = this.getFilename(fileName);

            fs.writeFileSync(filePath, content);

            this.attachments.push({
                filename: fileName,
                path: filePath,
                attachedEmail: !item.filename && item.contentType === 'message/rfc822'
            });
        }
        return this.attachments;
    }

    addFilesToFileList(files) {
        this.fileList = [...this.fileList, ...files];
    }

    deleteFolderRecursive(path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                // var curPath = path + "/" + file;
                var curPath = path + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }


    clearFiles(emailFile, listOfFiles) {
        if (fs.existsSync(emailFile)) fs.unlinkSync(emailFile);
        else this.log.add({ 'delete email file': `невозможно удалить файл: "${file}", т.к. он отсутствует` });

        if (listOfFiles) {
            for (const file of listOfFiles) {
                if (fs.existsSync(file.path)) {
                    if (file.isDirectory) this.deleteFolderRecursive(file.path)
                    else fs.unlinkSync(file.path);
                }
                else this.log.add({ 'delete attached file': `невозможно удалить файл: "${file}", т.к. он отсутствует` });
            }
        }
    }

    randomInteger() { return Math.floor((Math.random() * 10000) + 10000); }
}



module.exports = saveContent;