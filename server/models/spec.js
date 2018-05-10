const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class SpecError extends Error {
    constructor(message) {
      super(message);
      this.name = "MTAError";
    }
};

var SpecSchema = new mongoose.Schema({
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

SpecSchema.methods.toJSON = function() {
    var mta = this;
    var mtaObject = mta.toObject();
    return _.pick(mtaObject, ['_id', 'name']);
};

var handleDuplicateSpec = function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new SpecError(JSON.stringify({
            code: 400,
            errors: [{
                field: 'name',
                error: 'duplicate'
            }],
            userMessage: 'Name already taken. Please choose another.',
            internalMessage: 'duplicate name on spec table'
        })));
    } else {
      next();
    }
};

SpecSchema.post('save', handleDuplicateSpec);
SpecSchema.post('findOneAndUpdate', handleDuplicateSpec);

var Spec = mongoose.model('Spec', SpecSchema);

module.exports = {
    Spec,
    SpecError 
};