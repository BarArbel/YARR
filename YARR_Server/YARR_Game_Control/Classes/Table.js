var shortID = require('shortid');

module.exports = class Table {
    constructor(){
        var tempID = shortID.generate();
        this.time = Date.now();
        this.id = tempID.replace('-', '');
        this.id = tempID.replace('_', '');
    }
}