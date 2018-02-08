const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class ConsentError extends Error {
    constructor(message) {
      super(message);
      this.name = "ConsentError";
    }
};

var ConsentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: false
    },
    organization: {
        type: String,
        required: false
    },
    dir_path: {
        type: String,
        required: false
    },
    validity_date: {
        type: Date,
        required: false
    },
    description: {
        type: String,
        required: false 
    },
    created_by: {
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
    },
    date_updated: {
        type: Date,
        required: false
    },
    forms: [{
        _id: {
            type: String,
            required: false 
        },
        is_deleted: {
            type: Boolean,
            required: false 
        },
        name: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: false 
        },
        organization: {
            type: String,
            required: false 
        },
        date_created: {
            type: Date,
            required: false 
        }
    }]
});

ConsentSchema.pre('save', function(next){
    this.date_created = Date.now();
    this.is_deleted = false;

    if(this.forms.length > 0){
        for(const form of this.forms) {
            form.is_deleted = false;
        }
    }
    next();
});

ConsentSchema.pre('findIdAndUpdate', function(next){
    this.date_updated = Date.now();
    next();
});

var Consent = mongoose.model('Consent', ConsentSchema);

module.exports = {
    Consent,
    ConsentError 
};