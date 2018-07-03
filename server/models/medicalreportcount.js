const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class MedicalReportCountError extends Error {
    constructor(message) {
      super(message);
      this.name = "MedicalReportCountError";
    }
};

var MedicalReportCountSchema = new mongoose.Schema({
    results: {
         type: {Array}
    }
});

var MedicalReportCount = mongoose.model('MedicalReportCount', MedicalReportCountSchema);

module.exports = {
    MedicalReportCount,
    MedicalReportCountError 
};