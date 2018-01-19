const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class OrganizationError extends Error {
    constructor(message) {
      super(message);
      this.name = "OrganizationError";
    }
};

var OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
});

OrganizationSchema.methods.toJSON = function() {
    var caseObject = this.toObject();
    return _.pick(caseObject, ['_id', 'name']);
};

var handleDuplicateOrganization = function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new OrganizationError(JSON.stringify({
            code: 400,
            errors: [{
                field: 'name',
                error: 'duplicate'
            }],
            userMessage: 'Organization already taken. Please choose another.',
            internalMessage: 'duplicate organization name on organizations table'
        })));
    } else {
      next();
    }
};

OrganizationSchema.post('save', handleDuplicateOrganization);
OrganizationSchema.post('findOneAndUpdate', handleDuplicateOrganization);

var Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = {
    Organization,
    OrganizationError
};