const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Permission} = require('./../models/permission');
const {Role} = require('./../models/role');
const {Organization} = require('./../models/organization');
const {User} = require('./../models/user');
const {Form} = require('./../models/form');
const {Case} = require('./../models/case');
const {Resource} = require('./../models/fhir/resource');
const {IcdOncology} = require('./../models/icd/icdoncology');

var naaccr = require('./naaccr-codes.v16.json');
const Mongo = require('./../../databases/dbBackup');

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
    roles: ['Admin', 'Biobank Researcher', 'Medical Researcher'],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}];

const forms = [{
    _id: new ObjectID(),
    name: "General Info Sample Form",
    organization: "University of the Philippines - Philippine General Hospital",
    department: "My Department",
    type: "The Type",
    sections: [{
        key: new ObjectID,
        name: "General Details",
        order: 1,
        questions: [{
            "key": "NAME",
            "label": "What is your name?",
            "type": "text",
            "value": "",
            "options": "",
            "required": true,
            "order": 3
        },{
            "key": "GENDER",
            "label": "What is your gender?",
            "type": "dropdown",
            "value": "",
            "options": "Male|Female",
            "required": true,
            "order": 3
        },
        {
            "key": "AGE",
            "label": "What is your age?",
            "type": "text",
            "value": "",
            "options": "",
            "required": true,
            "order": 4
        }]
    }]
}];

const cases = [{
    _id: new ObjectID(),
    case_number: '999999',
    diagnosis: 'Some diagnosis here',
    forms: [{
        form_id: forms[0]._id.toHexString(),
        form_name: forms[0].name,
        answers: [{
            question_key: 'NAME',
            question_answer: 'Kristhian Tiu',
        }, {
            question_key: 'GENDER',
            question_answer: 'Male',
        },{
            question_key: 'AGE',
            question_answer: '21',
        }]
    }]
},{
    _id: new ObjectID(),
    case_number: '999998',
    diagnosis: 'Some diagnosis here',
    forms: [{
        form_id: forms[0]._id.toHexString(),
        form_name: forms[0].name,
        answers: [{
            question_key: 'NAME',
            question_answer: 'Philip Sales',
        }, {
            question_key: 'GENDER',
            question_answer: 'Male',
        },{
            question_key: 'AGE',
            question_answer: '30',
        }]
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

const populateForms = (done) => {
    return Form.remove({}).then(() => {
        return new Form(forms[0]).save();
    });
};

const populateCases = (done) => {
    let requests = [];  
    return Case.remove({}).then(() => {
        for(var i = 0; i < cases.length; ++i){
            requests.push(new Case(cases[i]).save())
        }
        return Promise.all(requests)
    });
};

const populateResources = (done) => {
    let requests = [];  
    let path = "server/db/fhir-resources.stu3.json";
    let collection = "fhirresources";

    return Mongo.dbImport(path, collection).then(() => { 
        return Promise.all(requests)
    });
};

const populateNaaccr = (done) => {
    let requests = [];  
    let path = "server/db/naaccr-codes.v16.json";
    let collection = "naaccr";

    return Mongo.dbImport(path, collection).then(() => { 
        return Promise.all(requests)
    });
};

const populateICDOncology = (done) => {
    let requests = [];  
    let path = "server/db/icd-oncology.v3.json";
    let collection = "icdoncologies";

    return Mongo.dbImport(path, collection).then(() => { 
        return Promise.all(requests)
    });
};

const populateTables = () => {

    var medical_standards_request = new Promise((resolve, reject) => {
        populateICDOncology().then(() => {
            console.log('--ICD -- Loaded');
            populateNaaccr().then(() => {
                console.log('--NAACCRR -- Loaded');
                populateResources().then(() => {
                    console.log('--FHIR Resources-- Loaded');
                    resolve();
                    })
                })
            })
        }).catch((error) => {
            console.log(error);
            console.log('--Medical Standards-- Error encountered');
            reject();
    });

    var forms_request = populateForms().then(() => {
        console.log('--Forms-- Loaded');
        populateCases().then(() => {
            console.log('--Cases-- Loaded');
        });
    });
    
    var users_etc_request = new Promise((resolve, reject) => {
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
    return Promise.all([
        medical_standards_request, 
        forms_request, 
        users_etc_request])
};

module.exports = {
    populateTables
} 