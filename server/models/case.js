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
        type: String,
        required: true,
        unique: true
    },
    diagnosis: {
        type: String
    },
    date_created: {
        type: Number
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
        date_created : {
            type: Number
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
    return _.pick(caseObject, ['_id', 'case_number', 'date_created', 'diagnosis', 'forms']);
};

CaseSchema.pre('save', function(next){
    if(!this.date_created) {
        this.date_created = (new Date()).getTime();
    }
    var total_forms = this.forms.length;

    for(var i = 0; i < total_forms; ++i){
        if(!this.forms[i].date_created){
            this.forms[i].date_created = (new Date()).getTime();
        }
    }
    next();
});

var Case = mongoose.model('Case', CaseSchema);

module.exports = {
    Case,
    CaseError
};