const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class MTAError extends Error {
    constructor(message) {
      super(message);
      this.name = "MTAError";
    }
};

var MTASchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    dir_path: {
        type: String,
        required: false
    },
    is_deleted: {
        type: Boolean,
        required: false 
    },
});

MTASchema.methods.toJSON = function() {
    var mta = this;
    var mtaObject = mta.toObject();
    return _.pick(mtaObject, [
    '_id', 
    'name', 
    'dir_path',
    'is_deleted']);
};

var MTA = mongoose.model('MTA', MTASchema);

module.exports = {
    MTA,
    MTAError 
};