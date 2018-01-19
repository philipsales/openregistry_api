const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Permission} = require('./../models/permission');
const {Role} = require('./../models/role');
const {User} = require('./../models/user');

const permissions = [{
    _id: new ObjectID(),
    perm_code: 'user_create',
    module: 'User Registration',
    application: 'Administration',
    description: 'can create a user'
}, {
    _id: new ObjectID(),
    perm_code: 'user_approve',
    module: 'User Registration',
    application: 'Administration',
    description: 'can approve a user'
}, {
    _id: new ObjectID(),
    perm_code: 'user_view',
    module: 'User Registration',
    application: 'Administration',
    description: 'can view a user'
}];

const roles = [{
    _id: new ObjectID(),
    rolename: 'Admin',
    description: 'role for Administrators',
    permissions: ['user_create', 'user_approve', 'user_view'],
    isActive: true
}, {
    _id: new ObjectID(),
    rolename: 'Researcher',
    description: 'role for Researchers',
    permissions: [],
    isActive: false
}, {
    _id: new ObjectID(),
    rolename: 'Physician',
    description: 'role for Physicians',
    permissions: [],
    isActive: false
}, {
    _id: new ObjectID(),
    rolename: 'Encoder',
    description: 'role for Encoders',
    permissions: [],
    isActive: false
}];

const userOneId = new ObjectID();
const users = [{
    _id: userOneId,
    username: 'admin@admin.com',
    first_name: 'Clarke',
    last_name: 'Simpson',
    middle_name: 'J',
    password: 'kryptonite',
    isDeleted: false,
    roles: ['Admin'],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}];

const populatePermissions = () => {
    let requests = [];
    return Permission.remove({}).then(() => {
        for(var i = 0; i < permissions.length; ++i){
            requests.push(new Permission(permissions[i]).save())
        }
        return Promise.all(requests)
    });
};


const populateRoles = () => {
    let requests = [];    
    return Role.remove({}).then(() => {
        for(var i = 0; i < roles.length; ++i){
            requests.push(new Role(roles[i]).save())
        }
        return Promise.all(requests)
    });
};

const populateUsers = (done) => {
    let requests = [];  
    return User.remove({}).then(() => {
        for(var i = 0; i < users.length; ++i){
            requests.push(new User(users[i]).save())
        }
        return Promise.all(requests)
    });
};

const populateTables = () => {
    return new Promise((resolve, reject) => {
        populatePermissions().then(() => {
            console.log('--Permissions-- Loaded');
            populateRoles().then(() => {
                console.log('--Roles-- Loaded');
                populateUsers().then(() => {
                    console.log('--Users-- Loaded');
                    resolve();
                })
            })
        }).catch((error) => {
            console.log(error);
            console.log('--populateTables-- Error encountered');
            reject();
        });
    });
};

module.exports = {
    populateTables
} 