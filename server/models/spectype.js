const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class SpecTypeError extends Error {
    constructor(message) {
      super(message);
      this.name = "MTAError";
    }
};

var SpecTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    is_deleted: {
        type: Boolean,
        required: false 
    },
});

SpecTypeSchema.methods.toJSON = function() {
    var mta = this;
    var mtaObject = mta.toObject();
    return _.pick(mtaObject, ['_id', 'name']);
};

var SpecType = mongoose.model('SpecType', MTASchema);

module.exports = {
    SpecType,
    SpecTypeError 
};