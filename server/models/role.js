var mongoose = require('mongoose');
const _ = require('lodash');
var {Permission} = require('./permission');

class RoleError extends Error {
    constructor(message) {
      super(message);
      this.name = "RoleError";
    }
};

var RoleSchema = new mongoose.Schema({
    rolename: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true
    },
    description: {
        type: String
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
    return _.pick(roleObject, ['_id', 'rolename', 'description', 'permissions', 'isActive']);
};

RoleSchema.pre('save', function(next) {
    var user = this;
    var permissions = user.permissions; 
    var permcopy = permissions.slice();
    var total_permissions = permissions.length;
    if(total_permissions > 0){
        for(var i=0; i < total_permissions; ++i){
            Permission.findOne({perm_code: permissions[i]}, function (err, doc) {
                if (err || !doc) {
                    next(new RoleError(JSON.stringify({
                        code: 400,
                        errors: [{
                            field: 'permissions',
                            error: 'invalid'
                        }],
                        userMessage: 'One or more permissions are invalid. Please check.',
                        internalMessage: 'possible invalid permissions'
                    })));
                } else {
                    const index = permcopy.indexOf(doc.perm_code);
                    permcopy.splice(index, 1);

                    if(permcopy.length == 0){
                        next();
                    }
                }
            });
        }
    } else {
        next();
    }
});


RoleSchema.pre('findOneAndUpdate', function(next){
    const permissionsUpdate = this.getUpdate().$set.permissions;
    if(permissionsUpdate){
        var permcopy = permissionsUpdate.slice();
        var total_permissions = permissionsUpdate.length;
        if(total_permissions > 0){
            for(var i=0; i < total_permissions; ++i){
                Permission.findOne({perm_code: permissionsUpdate[i]}, function (err, doc) {
                    if (err || !doc) {
                        next(new RoleError(JSON.stringify({
                            code: 400,
                            errors: [{
                                field: 'permissions',
                                error: 'invalid'
                            }],
                            userMessage: 'One or more permissions are invalid. Please check.',
                            internalMessage: 'possible invalid permissions'
                        })));
                    } else {
                        const index = permcopy.indexOf(doc.perm_code);
                        permcopy.splice(index, 1);

                        if(permcopy.length == 0){
                            next();
                        }
                    }
                });
            }
        } else {
            next();
        }
    } else {
        next();
    }
});

var handleDuplicateRolename = function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new RoleError(JSON.stringify({
            code: 400,
            errors: [{
                field: 'rolename',
                error: 'duplicate'
            }],
            userMessage: 'Rolename already taken. Please choose another.',
            internalMessage: 'duplicate rolename on roles table'
        })));
    } else {
      next();
    }
};

RoleSchema.post('save', handleDuplicateRolename);
RoleSchema.post('findOneAndUpdate', handleDuplicateRolename);


var Role = mongoose.model('Role', RoleSchema);

module.exports = {
    Role,
    RoleError
};