const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class ResourceError extends Error {
    constructor(message) {
      super(message);
      this.name = "FhirResourceError";
    }
};

var ResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    reference: {
        type: String,
        required: false
    },
    date_created: {
        type: Date,
        required: false
    },
    is_deleted: {
        type: Boolean,
        required: false
    }
});


var Resource = mongoose.model('FhirResource', ResourceSchema);

module.exports = {
    Resource,
    ResourceError
};