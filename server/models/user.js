var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 6,
        trim: true,
        unique: true
    },
    fullname: {
        type: String,
        require: true,
        minLength: 1
    },
    password: {
        type: String,
        require: true,
        minLength: 6
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User
};