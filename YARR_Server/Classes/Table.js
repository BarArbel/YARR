var shortID = require('shortid');

module.exports = class Table {
    constructor(){
        this.time = Date.now();
        this.id = shortID.generate().replace('-', '');
    }
}