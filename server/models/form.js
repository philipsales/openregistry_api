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
    title: {
        type: String,
        required: true,
        minlength: 1
    },
    coinvestigator: {
        type: String
    },
    principalinvestigator: [{
        _id: false,
        id: {
            type: String
        },
        name: {
            type: String
        }
    }],
    organization: {
        type: [String],
        required: true,
        minLength: 1
    },  
    department: {
        type: [String],
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
    dir_path: {
        type: String
    }, 
    created_by: {
        type: String
    }, 
    date_created: {
        type: Number
    }, 
    validity_date: {
        type: Date 
    }, 
    isActive: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    is_table: {
        type: Boolean,
        default: false
    },
    table_section: [{
        specimen: {
            type: String,
            required: true
        },  
        type: {
            type: String,
            required: true
        }
    }],
    sections: [{
        key: {
            type: String,
            required: true
        },  
        name: {
            type: String,
            required: true
        },
        isTable: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number
        },  
        questions: [{
            key: {
                type: String,
                required: true,
                minLength: 6,
                trim: true
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
    let json = _.pick(formObject, [
        '_id', 
        'name',
        'title', 
        'coinvestigator',
        'principalinvestigator',
        'organization', 
        'department', 
        'type', 
        'dir_path', 
        'approval', 
        'validity_date', 
        'status', 
        'created_by', 
        'date_created', 
        'is_deleted', 
        'table_section',
        'sections']);
    let now = new Date();
    now.setHours(0,0,0,0);
    json['isValid'] = json['validity_date'] > now;
    return json;
};

FormSchema.pre('save', function(next){
    this.date_created = Date.now();
    this.is_deleted = false;
    this.status = 'Pending';
    next();
});

var Form = mongoose.model('Form', FormSchema);

module.exports = {
    Form,
    FormError
};