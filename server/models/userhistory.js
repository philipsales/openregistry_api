const _ = require('lodash');
var mongoose = require('mongoose');

class UserHistoryError extends Error {
    constructor(message) {
      super(message);
      this.name = "QuestionError";
    }
};

var UserHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    dateUserCreated: {
        type: String,
        required: true
    },
    dateHistoryCreated: {
        type: String,
        required: true
    }
}, {strict: false});

var UserHistory = mongoose.model('UserHistory', UserHistorySchema);

module.exports = {
    UserHistory,
    UserHistoryError
}