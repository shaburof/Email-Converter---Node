const fs = require('fs');
const path = require('path');
const Seven = require('node-7z');

class unpack {

    constructor() {
        this.globalFilesDirectory = __dirname + path.sep + '..' + path.sep + 'files' + path.sep;
    }

    async go(files) {
        let _files = []
        for (const file of files) {
            if (file.archive) {
                const newFile = await this.createDirForUnpackingFiles(file).catch(err => console.log(err));
                const directoryObject = await this.unpack(newFile).catch(err => console.log(err));
                const listUnpackingFiles = await this.getFilesFromArchive(directoryObject.path).catch(err => console.log(err));
                _files = [..._files, ...listUnpackingFiles, directoryObject];
            }
            _files.push(file);
        }
        return _files;
    };

    async createDirForUnpackingFiles(file) {
        const _file = {};
        const randomArchiveName = this.rn() + file.filename;
        fs.mkdir(this.globalFilesDirectory + randomArchiveName, { recursive: true }, err => {
            err && console.log(err);
        });
        _file.archiveName = randomArchiveName;
        _file.archivePath = this.globalFilesDirectory + randomArchiveName + path.sep;

        return { ...file, ..._file };
    }

    async unpack(archive) {
        const dir = `${__dirname + path.sep}files${path.sep}`;
        const arcFile = archive.path;
        const arcOutput = archive.archivePath;
        // const files = [];


        const upPromise = new Promise((resolve, reject) => {
            const myStream = Seven.extractFull(arcFile, arcOutput, {
                recursive: true,
            });
            myStream.on('error', err => reject(err));
            // myStream.on('end', () => resolve(files));
            myStream.on('end', () => {
                resolve({
                    filename: archive.archiveName,
                    path: arcOutput,
                    isDirectory: true
                })
            });

            // myStream.on('data', function (data) {
            //     if (data.status === 'extracted') {
            //         const fileInfo = { filename: data.file, path: output + data.file }
            //         files.push(fileInfo);
            //     }
            // })
        });
        return upPromise;
    };


    async readDir(dir) {
        return new Promise(async (resolve, reject) => {
            fs.readdir(dir, async (err, files) => {
                err && reject(err);
                resolve(files)
            });
        });
    }
    async isDir(file) {
        return new Promise(async (resolve, reject) => {
            fs.stat(file, (err, stat) => {
                err && reject(err);

                resolve(stat.isDirectory());
            });
        });
    }


    async getFilesFromArchive(dir) {
        let list = [];
        const files = await this.readDir(dir).catch(err => console.log(err));
        for (const file of files) {

            if (await this.isDir(dir + file)) {
                let qwe = await this.getFilesFromArchive(dir + file + path.sep);
                list = [...list, ...qwe];
            }
            else {
                list.push({
                    filename: file,
                    path: dir + file,
                });
            }
        }
        return list;
    };


    rn() { return Math.floor((Math.random() * 10000) + 10000); }

}

module.exports = unpack;