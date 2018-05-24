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
        required: true
    },
    organization: {
        type: String
    },
    diagnosis: {
        type: String
    },
    date_created: {
        type: Number
    },
    created_by: {
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
        date_created : {
            type: Number
        },
        created_by: {
            type: String 
        },
        is_deleted: {
            type: Boolean ,
            default: false,
        },
        status: {
            type: Boolean,
            default: false,
        },
        answers: [{
            question_key: {
                type: String
            },
            /*
            question_answer: {
                type: String
            },
            */
            question_answer: [{
                type: String
            }]
        }]
    }],
    is_deleted:{
        type: Boolean,
        default: false
    },
    status:{
        type: Boolean,
        default: false 
    },
    is_active:{
        type: Boolean,
        default: true 
    }
});


CaseSchema.methods.toJSON = function() {
    var caseObject = this.toObject();
    return _.pick(caseObject, [
        '_id', 
        'case_number', 
        'organization',
        'status', 
        'is_deleted', 
        'created_by', 
        'is_active', 
        'date_created', 
        'diagnosis', 
        'forms']);
};

CaseSchema.pre('save', function(next){
    console.log('---_FIND_SAVE--',this.forms);
    if(!this.date_created) {
        this.date_created = (new Date()).getTime();
    }
    var total_forms = this.forms.length;

    for(var i = 0; i < total_forms; ++i){
        console.log('---_FIND_ANSWERS--',this.forms[i].answers);
        if(!this.forms[i].date_created){
            this.forms[i].date_created = (new Date()).getTime();
        }
    }
    next();
});

CaseSchema.pre('findOneAndUpdate', function(next){
    console.log('---_FIND_ONE_AND_UPDATE--');
    const forms = this.getUpdate().$set.forms;
    if(forms){
        const total_forms = forms.length;
        for(var i=0; i < total_forms; ++i){
            if(!forms[i].date_created){
                forms[i].date_created = (new Date()).getTime();
            }
        }
        this.findOneAndUpdate({}, {
            forms: forms
        });
    } 
    next();
});

var Case = mongoose.model('Case', CaseSchema);

module.exports = {
    Case,
    CaseError
};