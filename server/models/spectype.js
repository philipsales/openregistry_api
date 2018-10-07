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
        required: false,
        default: false
    },
});

SpecTypeSchema.methods.toJSON = function() {
    var mta = this;
    var mtaObject = mta.toObject();
    return _.pick(mtaObject, ['_id', 'name']);
};


var handleDuplicateSpecType = function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new SpecTypeError(JSON.stringify({
            code: 400,
            errors: [{
                field: 'name',
                error: 'duplicate'
            }],
            userMessage: 'Name already taken. Please choose another.',
            internalMessage: 'duplicate name on SpecType table'
        })));
    } else {
      next();
    }
};

SpecTypeSchema.post('save', handleDuplicateSpecType);
SpecTypeSchema.post('findOneAndUpdate', handleDuplicateSpecType);

var SpecType = mongoose.model('SpecType', SpecTypeSchema);

module.exports = {
    SpecType,
    SpecTypeError 
};