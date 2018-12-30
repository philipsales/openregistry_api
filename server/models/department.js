const _ = require('lodash');
var mongoose = require('mongoose');

var DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    code: {
        type: String
    },
    organization: {
        id: {type: String},
        name: {type: String}
    }
});

DepartmentSchema.methods.toJSON = function () {
    var caseObject = this.toObject();
    return _.pick(caseObject, ['_id', 'name', 'description', 'code', 'organization']);
}

var handleDuplicateDepartment = function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next({
            code: 400,
            errors: [{
                field: 'name',
                error: 'duplicate'
            }],
            userMessage: 'Department name\'s already taken. Please choose another.',
            internalMessage: 'duplicate department name on departments table'
        });
    } else {
      next();
    }
};

DepartmentSchema.post('save', handleDuplicateDepartment);
DepartmentSchema.post('findOneAndUpdate', handleDuplicateDepartment);

var Department = mongoose.model('Department', DepartmentSchema);

module.exports = {
    Department
}