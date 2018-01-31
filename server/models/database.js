const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class DatabaseError extends Error {
    constructor(message) {
      super(message);
      this.name = "DatabaseError";
    }
};

var DatabaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    longName: {
        type: String,
        required: false
    },
    dirPath: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false 
    },
    createdBy: {
        type: String,
        required: false 
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    dateCreated: {
        type: Date,
        required: false
    },
    isDeleted: {
        type: Boolean,
        required: false
    }
});

DatabaseSchema.pre('save', function(next){
    this.dateCreated = Date.now();
    this.directoryPath = '/dump';
    this.isDeleted = false;
    next();
});

var Database = mongoose.model('Database', DatabaseSchema);

module.exports = {
    Database,
    DatabaseError 
};