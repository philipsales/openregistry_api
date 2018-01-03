const {ObjectID} = require('mongodb');

const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    username: 'b.kristhian.tiu@gmail.com',
    fullname: 'Kristhian Tiu',
    password: 'userOnePass'
}, {
    _id: userTwoId,
    username: 'b.kristhian.tiu2@gmail.com',
    fullname: 'Chan Tiu',
    password: 'userTwoPass'
}];

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {
    users,
    populateUsers
} 