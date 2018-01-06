var mongoose = require('mongoose');
const _ = require('lodash');

var RoleSchema = new mongoose.Schema({
    rolename: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true
    },
    permissions: [String],
    isActive: {
        type: Boolean,
        default: true
    }
});

RoleSchema.methods.toJSON = function() {
    var role = this;
    var roleObject = role.toObject();
    return _.pick(roleObject, ['_id', 'rolename', 'permissions']);
};

var Role = mongoose.model('Role', RoleSchema);

module.exports = {
    Role
};