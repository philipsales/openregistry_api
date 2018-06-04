const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class MedicalReportError extends Error {
    constructor(message) {
      super(message);
      this.name = "MedicalReportError";
    }
};

var MedicalReportSchema = new mongoose.Schema({
    results: {
         //type: Array
         type: {Array}
    }
});

var MedicalReport = mongoose.model('MedicalReport', MedicalReportSchema);

module.exports = {
    MedicalReport,
    MedicalReportError 
};