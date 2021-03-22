const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class convert {

    constructor() {
        this.workDir = `${__dirname + path.sep}..${path.sep}files${path.sep}`;
    }

    executeString(pathToFile) {

        return `soffice --headless --convert-to pdf '${pathToFile}' --outdir ${this.workDir}`
    }

    async go(file) {

        const result = await new Promise((resolve, reject) => {
            this.exeCommand = exec(this.executeString(file.path));
            this.exeCommand.on('exit', () => {
                resolve({ status: true });
            });
        });

        // const newPath = this.getNewFileName(file.path);
        // const newPath = this.workDir + this.getNewFileName(file.filename);
        const newName = this.getNewFileName(file.path);

        if (!this.checkSuccess(this.workDir + newName)) return { status: false }
        return { status: true, filename: newName, path: this.workDir + newName, extension: 'pdf' };
    }

    checkSuccess(path) {
        return fs.existsSync(path);
    }

    getNewFileName(name) {
        const splitName = name.split('/').pop();
        return splitName.slice(0, splitName.lastIndexOf('.')) + '.pdf';
        // return name.slice(0, name.lastIndexOf('.')) + '.pdf';
    }
}

module.exports = convert;