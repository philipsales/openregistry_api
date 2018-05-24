var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var options = {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
    auth: {
          authdb: process.env.DATABASE
    }
}

mongoose.connect(process.env.MONGODB_URI,options);

mongoose.exports = {
    mongoose
}