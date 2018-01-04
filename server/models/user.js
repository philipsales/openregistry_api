const _ = require('lodash');
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class UserError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "UserError"; // (2)
    }
};

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 6,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
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
    },
    isDeleted: {
        type: Boolean,
        require: true,
        minLength: 6,
        default: false
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.pre('save', function(next){
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.pre('findOneAndUpdate', function(next){
    const passwordUpdate = this.getUpdate().$set.password;
    if(passwordUpdate){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(passwordUpdate, salt, (err, hash) => {
                this.findOneAndUpdate({}, {
                    password: hash 
                });
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
    user.tokens.push({access, token});
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: {token}
        }
    })
};

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function(username, password) {
    var User = this;
    return User.findOne({username}).then((user) => {
        if (!user){
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    resolve(user);
                } else {
                    reject();
                }
            })
        });
    });
};

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'username', 'fullname']);
};

UserSchema.post('save', function(error, res, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new UserError(JSON.stringify({
            code: 400,
            errors: [{
                field: 'username',
                error: 'duplicate'
            }],
            userMessage: 'Username already taken. Please choose another.',
            internalMessage: 'duplicate username on users table'
        })));
    } else if (error.name === 'ValidationError' && error.errors.username) {
        const invalidEmailMessage = error.errors.username.message;
        next(new UserError(JSON.stringify({
            code: 400,
            errors: [{
                field: 'username',
                error: 'invalid email address'
            }],
            userMessage: invalidEmailMessage,
            internalMessage: 'validation errors'
        })));
    } else {
      next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User,
    UserError
};