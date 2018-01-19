const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Permission} = require('./../models/permission');
const {Role} = require('./../models/role');
const {Organization} = require('./../models/organization');
const {User} = require('./../models/user');

const permissions = [{
    _id: new ObjectID(),
    perm_code: 'admin_user_create',
    module: 'User Registration',
    application: 'Administration',
    description: 'can create a user'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_user_approve',
    module: 'User Registration',
    application: 'Administration',
    description: 'can approve a user'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_user_view',
    module: 'User Registration',
    application: 'Administration',
    description: 'can view a user'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_questions_create',
    module: 'Data Configuration',
    application: 'Biobank',
    description: 'can create questions'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_questions_update',
    module: 'Data Configuration',
    application: 'Biobank',
    description: 'can update questions'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_questions_publish',
    module: 'Data Configuration',
    application: 'Biobank',
    description: 'can publish questions'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_questions_create',
    module: 'Data Configuration',
    application: 'Medical',
    description: 'can create questions'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_questions_update',
    module: 'Data Configuration',
    application: 'Medical',
    description: 'can update questions'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_questions_publish',
    module: 'Data Configuration',
    application: 'Medical',
    description: 'can publish questions'
}];

const roles = [{
    _id: new ObjectID(),
    rolename: 'Admin',
    description: 'role for Administrators',
    permissions: ['admin_user_create', 'admin_user_approve', 'admin_user_view'],
    isActive: true
}, {
    _id: new ObjectID(),
    rolename: 'Biobank Researcher',
    description: 'role for Researchers from UPD',
    permissions: ['biobank_questions_create', 'biobank_questions_update', 'biobank_questions_publish'],
    isActive: false
}, {
    _id: new ObjectID(),
    rolename: 'Medical Researcher',
    description: 'role for Researchers from PGH',
    permissions: ['medical_questions_create', 'medical_questions_update', 'medical_questions_publish'],
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

const organizations = [{
    _id: new ObjectID(),
    "name": "University of the Philippines - Philippine General Hospital",
    "isDeleted": false
},
{
    _id: new ObjectID(),
    "name": "University of the Philippines Diliman",
    "isDeleted": false
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

const populateOrgs = () => {
    let requests = [];    
    return Organization.remove({}).then(() => {
        for(var i = 0; i < organizations.length; ++i){
            requests.push(new Organization(organizations[i]).save())
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
                populateOrgs().then(() => {
                    console.log('--Organizations-- Loaded');
                    populateUsers().then(() => {
                        console.log('--Users-- Loaded');
                        resolve();
                    })
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