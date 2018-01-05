var mongoose = require('mongoose');

var PermissionSchema = new mongoose.Schema({
    perm_code: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true
    },
    application: {
        type: String,
        require: true,
        minLength: 1
    },
    description: {
        type: String,
        require: true,
        minLength: 6
    }
});

var Permission = mongoose.model('Permission', PermissionSchema);

module.exports = {
    Permission
};