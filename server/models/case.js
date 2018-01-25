const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
var {Role} = require('./role');

class CaseError extends Error {
    constructor(message) {
      super(message);
      this.name = "CaseError";
    }
};

var CaseSchema = new mongoose.Schema({
    case_number: {
        type: Number,
        required: true,
        unique: true
    },
    diagnosis: {
        type: String
    },
    forms: [{
        form_id : {
            type: String,
            required: true
        },
        form_name : {
            type: String,
            required: true
        },
        answers: [{
            question_key: {
                type: String,
                required: true
            },
            question_answer: {
                type: String,
                required: true
            }
        }]
    }],
    isDeleted:{
        type: Boolean,
        default: false
    }
});


CaseSchema.methods.toJSON = function() {
    var caseObject = this.toObject();
    return _.pick(caseObject, ['_id', 'case_number', 'diagnosis', 'forms']);
};

var Case = mongoose.model('Case', CaseSchema);

module.exports = {
    Case,
    CaseError
};