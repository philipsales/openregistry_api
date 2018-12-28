const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class MedicalReportParameterError extends Error {
    constructor(message) {
      super(message);
      this.name = "MedicalReportParameterError";
    }
};

var MedicalReportParameterSchema = new mongoose.Schema({
    results: {
         type: {Array}
    }
});

var MedicalReportParameter = mongoose.model('MedicalReportParameter', MedicalReportParameterSchema);

module.exports = {
    MedicalReportParameter,
    MedicalReportParameterError 
};