const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class MedicalReportCountResultError extends Error {
    constructor(message) {
      super(message);
      this.name = "MedicalReportCountResultError";
    }
};

var MedicalReportCountResultSchema = new mongoose.Schema({
    results: {
         type: {Array}
    }
});

var MedicalReportCountResult = mongoose.model('MedicalReportCountResult', MedicalReportCountResultSchema);

module.exports = {
    MedicalReportCountResult,
    MedicalReportCountResultError 
};