var shortID = require('shortid');

module.exports = class Table {
    constructor(){
        var tempID = shortID.generate();
        this.time = Date.now();
        tempID = tempID.replace('-', '');
        tempID = tempID.replace('_', '');
        this.id = tempID;
    }
}