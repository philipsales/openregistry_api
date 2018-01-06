const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Permission} = require('./../../models/permission');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();

const users = [{
    _id: userOneId,
    username: 'b.kristhian.tiu@gmail.com',
    fullname: 'Kristhian Tiu',
    password: 'userOnePass',
    isDeleted: false,
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    username: 'b.kristhian.tiu2@gmail.com',
    fullname: 'Chan Tiu',
    password: 'userTwoPass',
    isDeleted: false,
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }],
},{
    _id: userThreeId,
    username: 'angelobriones@gmail.com',
    fullname: 'AngeloBriones',
    password: 'userThreePass',
    isDeleted: true,
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userThreeId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}];

const permissions = [{
    _id: new ObjectID(),
    perm_code: 'add_user',
    application: 'Admin',
    describe: 'can add a new user'
}, {
    _id: new ObjectID(),
    perm_code: 'delete_user',
    application: 'Admin',
    describe: 'can delete a new user'
}];

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        var userThree = new User(users[2]).save();
        return Promise.all([userOne, userTwo, userThree])
    }).then(() => done());
};

const populatePermissions = (done) => {
    Permission.remove({}).then(() => {
        var permissionOne = new Permission(permissions[0]).save();
        var permissionTwo = new Permission(permissions[1]).save();
        return Promise.all([permissionOne, permissionTwo])
    }).then(() => done());
};

module.exports = {
    users,
    populateUsers,
    permissions,
    populatePermissions
} 