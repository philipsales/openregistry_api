const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
var {Role} = require('./role');

class QuestionError extends Error {
    constructor(message) {
      super(message);
      this.name = "QuestionError";
    }
};

var QuestionSchema = new mongoose.Schema({
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
});


QuestionSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'key', 'label', 'value', 'options', 'order', 'required']);
};

var Question = mongoose.model('Question', QuestionSchema);

module.exports = {
    Question,
    QuestionError
};