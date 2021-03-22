// const allowMime = ['one', 'two', 'three'];
const allowMime = [
    { type: 'one', convert: false, archive: true },
    { type: 'two', convert: false },
    { type: 'three', convert: false },
]

module.exports = allowMime;