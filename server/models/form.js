const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
var {Role} = require('./role');

class FormError extends Error {
    constructor(message) {
      super(message);
      this.name = "FormError";
    }
};

var FormSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minLength: 1
    },
    organization: {
        type: String,
        required: true,
        minLength: 1
    },  
    department: {
        type: String,
        required: true,
        minLength: 1
    },
    type: {
        type: String,
        required: true,
        minLength: 1
    },
    approval: {
        type: String
    },  
    status: {
        type: String
    }, 
    created_by: {
        type: String
    }, 
    date_created: {
        type: Number
    }, 
    is_deleted: {
        type: Boolean,
        default: false
    },
    sections: [{
        key: {
            type: String,
            required: true
        },  
        name: {
            type: String,
            required: true
        },
        order: {
            type: Number
        },  
        questions: [{
            key: {
                type: String,
                required: true,
                minLength: 6,
                trim: true,
                unique: true
            },
            label: {
                type: String,
                minLength: 1
            },
            type: {
                type: String,
                require: true,
                minLength: 1
            },
            value: {
                type: String,
                minLength: 1
            },
            options: {
                type: String,
                minLength: 1
            },
            required: {
                type: Boolean,
                default: false
            },
            order: {
                type: Number
            }
        }]
    }]
});

FormSchema.methods.toJSON = function() {
    var form = this;
    var formObject = form.toObject();
    return _.pick(formObject, ['_id', 'name', 'organization', 'department', 'type', 'approval', 'status', 'created_by', 'date_created', 'is_deleted', 'sections']);
};

var Form = mongoose.model('Form', FormSchema);

module.exports = {
    Form,
    FormError
};