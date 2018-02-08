const {ObjectID} = require('mongodb');

const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class IcdOncologyError extends Error {
    constructor(message) {
      super(message);
      this.name = "IcdOncologyError";
    }
};

var IcdOncologySchema = new mongoose.Schema({
    diagnosis_name: {
        type: String,
        required: false
    },
    diagnosis_code: {
        type: String,
        required: false
    },
    histology_name : {
        type: String,
        required: false
    },
    site_name: {
        type: String,
        required: false
    }
});


var IcdOncology = mongoose.model('IcdOncology', IcdOncologySchema);

module.exports = {
    IcdOncology,
    IcdOncologyError
};