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
const {Spec} = require('./../models/spec');
const {SpecType} = require('./../models/spectype');

const Mongo = require('./../../databases/dbCmd');

const permissions = [{
    _id: new ObjectID(),
    perm_code: 'admin_user_create',
    module: 'User Registration',
    application: 'Administration',
    description: 'can create a user'
}

, {
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
    perm_code: 'admin_user_update',
    module: 'User Registration',
    application: 'Administration',
    description: 'can update a user'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_user_password_create',
    module: 'User Registration',
    application: 'Administration',
    description: 'can create other user password'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_user_password_update',
    module: 'User Registration',
    application: 'Administration',
    description: 'can update other user password'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_role_create',
    module: 'Roles and Permissions',
    application: 'Administration',
    description: 'can create a role'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_role_view',
    module: 'Roles and Permissions',
    application: 'Administration',
    description: 'can view a role'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_role_update',
    module: 'Roles and Permissions',
    application: 'Administration',
    description: 'can update a role'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_user_role_assign',
    module: 'Roles and Permissions',
    application: 'Administration',
    description: 'can assign a user to a role'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_role_permission_assign',
    module: 'Roles and Permissions',
    application: 'Administration',
    description: 'can assign a permissions to role'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_database_create',
    module: 'Database',
    application: 'Administration',
    description: 'can create a database backup'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_database_update',
    module: 'Database',
    application: 'Administration',
    description: 'can update a database backup'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_database_restore',
    module: 'Database',
    application: 'Administration',
    description: 'can restore a database backup'
}, {
    _id: new ObjectID(),
    perm_code: 'admin_database_download',
    module: 'Database',
    application: 'Administration',
    description: 'can download a database backup'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_form_create',
    module: 'Consent Forms',
    application: 'Biobank',
    description: 'can create a consent form'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_form_update',
    module: 'Consent Forms',
    application: 'Biobank',
    description: 'can update a consent form'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_form_view',
    module: 'Consent Forms',
    application: 'Biobank',
    description: 'can view a consent form'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_form_approve',
    module: 'Consent Forms',
    application: 'Biobank',
    description: 'can approve/reject a consent form'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_form_delete',
    module: 'Consent Forms',
    application: 'Biobank',
    description: 'can delete a consent form'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_case_create',
    module: 'Cases',
    application: 'Biobank',
    description: 'can create a case'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_case_update',
    module: 'Cases',
    application: 'Biobank',
    description: 'can update a case'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_case_view',
    module: 'Cases',
    application: 'Biobank',
    description: 'can view a case'
}, {
    _id: new ObjectID(),
    perm_code: 'biobank_case_approve',
    module: 'Cases',
    application: 'Biobank',
    description: 'can approve a case'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_mta_create',
    module: 'MTA / Agreement Form',
    application: 'Biobank',
    description: 'can create mta'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_mta_update',
    module: 'MTA / Agreement Form',
    application: 'Biobank',
    description: 'can update mta'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_mta_view',
    module: 'MTA / Agreement Form',
    application: 'Biobank',
    description: 'can view mta'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_mta_delete',
    module: 'MTA / Agreement Form',
    application: 'Biobank',
    description: 'can delete mta'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimen_create',
    module: 'Specimen',
    application: 'Biobank',
    description: 'can create specimen'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimen_update',
    module: 'Specimen',
    application: 'Biobank',
    description: 'can update specimen'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimen_view',
    module: 'Specimen',
    application: 'Biobank',
    description: 'can view specimen'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimen_delete',
    module: 'Specimen',
    application: 'Biobank',
    description: 'can delete specimen'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimentype_create',
    module: 'Specimen Type',
    application: 'Biobank',
    description: 'can create specimen type'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimentype_update',
    module: 'Specimen Type',
    application: 'Biobank',
    description: 'can update specimen type'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimentype_view',
    module: 'Specimen Type',
    application: 'Biobank',
    description: 'can view specimen type'
},  {
    _id: new ObjectID(),
    perm_code: 'biobank_specimentype_delete',
    module: 'Specimen Type',
    application: 'Biobank',
    description: 'can delete specimen type'
},  {
    _id: new ObjectID(),
    perm_code: 'medical_form_create',
    module: 'Medical Forms',
    application: 'Medical',
    description: 'can create a medical form'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_form_update',
    module: 'Medical Forms',
    application: 'Medical',
    description: 'can update a medical form'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_form_view',
    module: 'Medical Forms',
    application: 'Medical',
    description: 'can view a medical form'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_form_approve',
    module: 'Medical Forms',
    application: 'Medical',
    description: 'can approve/reject a medical form'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_form_delete',
    module: 'Medical Forms',
    application: 'Medical',
    description: 'can delete a medical form'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_case_create',
    module: 'Cases',
    application: 'Medical',
    description: 'can create a case'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_case_update',
    module: 'Cases',
    application: 'Medical',
    description: 'can update a case'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_case_view',
    module: 'Cases',
    application: 'Medical',
    description: 'can view a case'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_case_approve',
    module: 'Cases',
    application: 'Medical',
    description: 'can approve a case'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_report_download',
    module: 'Reports',
    application: 'Medical',
    description: 'can download a report'
}, {
    _id: new ObjectID(),
    perm_code: 'medical_report_view',
    module: 'Reports',
    application: 'Medical',
    description: 'can view a report'
}

];

const roles = [{
    _id: new ObjectID(),
    rolename: 'Admin',
    description: 'role for Administrators',
    permissions: [
        'admin_user_create', 
        'admin_user_approve', 
        'admin_user_view', 
        'admin_role_create', 
        'admin_role_update', 
        'admin_role_view'],
    isActive: true
} 
];

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
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();
const users = [{
    _id: userOneId,
    username: 'admin@admin.com',
    first_name: 'Clarke',
    last_name: 'Simpson',
    middle_name: 'J',
    password: 'kryptonite',
    isDeleted: false,
    isActive: true,
    roles: ['Admin'],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
},{
    _id: userTwoId,
    username: 'biobank@admin.com',
    first_name: 'John',
    last_name: 'Travolta',
    middle_name: 'J',
    password: 'topsecret',
    isDeleted: false,
    isActive: true,
    department: ['Institute of Biology'],
    roles: ['Biobank Researcher'],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
},{
    _id: userThreeId,
    username: 'medical@admin.com',
    first_name: 'Jason',
    last_name: 'Myers',
    middle_name: 'J',
    password: 'topsecret',
    isDeleted: false,
    isActive: true,
    department: ['General Surgery Department'],
    roles: ['Medical Researcher'],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userThreeId, access: 'auth'}, process.env.JWT_SECRET).toString()
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
},
{
    _id: new ObjectID(),
    name: "Specimen Collection Form",
    organization: "University of the Philippines Diliman",
    department: "Institute of Biology",
    type: "Biobanking Repository",
    status: "Approved",
    sections: [{
        key: new ObjectID,
        name: "My Collection",
        order: 1,
        isTable: true,
        questions: [{
            "key": "QTY",
            "label": "QTY",
            "type": "textbox",
            "value": "",
            "options": "",
            "required": false,
            "order": 1
        },{
            "key": "SPECIMEN",
            "label": "Specimen",
            "type": "dropdown",
            "value": "",
            "options": "Urine|Stool",
            "required": false,
            "order": 2
        },
        {
            "key": "COLTYPE",
            "label": "Type",
            "type": "dropdown",
            "value": "",
            "options": "Frozen|Solid",
            "required": true,
            "order": 3
        },{
            "key": "CHARACTERISTIC",
            "label": "Characteristic",
            "type": "textbox",
            "value": "",
            "options": "",
            "required": false,
            "order": 4
        },{
            "key": "QTYAVAIL",
            "label": "Quantity Available",
            "type": "textbox",
            "value": "",
            "options": "",
            "required": false,
            "order": 5
        }]
    }]
}];

const cases = [{
    _id: new ObjectID(),
    case_number: '999999',
    organization: organizations[0]._id.name,
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
    organization: organizations[0]._id.name,
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


const specs = [{
    _id: new ObjectID(),
    "name": "Urine",
    "is_deleted": false
},
{
    _id: new ObjectID(),
    "name": "Blood",
    "is_deleted": false
},
{
    _id: new ObjectID(),
    "name": "Plasma",
    "is_deleted": false
},
{
    _id: new ObjectID(),
    "name": "Serum",
    "is_deleted": false
}];

const spectypes = [{
    _id: new ObjectID(),
    "name": "Frozen",
    "is_deleted": false
},
{
    _id: new ObjectID(),
    "name": "Embedded",
    "is_deleted": false
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
    let requests = [];  
    return Form.remove({}).then(() => {
        for(var i = 0; i < forms.length; ++i){
            requests.push(new Form(forms[i]).save());
        }
        return Promise.all(requests);
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

const populateBreastPGHForm = (done) => {
    let requests = [];  
    let path = "server/db/form-breast-cancer.pgh.json"  
    let collection = "forms";
    return Mongo.dbImport(path, collection).then(() => { 
        return Promise.all(requests)
    });
};

const populateObgynPGHForm = (done) => {
    let requests = [];  
    let path = "server/db/form-obgyn-cancer.pgh.json"  
    let collection = "forms";
    return Mongo.dbImport(path, collection).then(() => { 
        return Promise.all(requests)
    });
};

const populateTables = () => {

    var specrequest = new Promise((resolve, reject) => {
        populateSpecs().then(() => {
            console.log('--Specs-- Loaded');
        });
    });

    var spectyperequest = new Promise((resolve, reject) => {
        populateSpecTypes().then(() => {
            console.log('--Spec Types-- Loaded');
        });
    });

    var medical_standards_request = new Promise((resolve, reject) => {
        populateICDOncology().then(() => {
            console.log('--ICD -- Loaded');
            populateNaaccr().then(() => {
                console.log('--NAACCRR -- Loaded');
                populateResources().then(() => {
                    console.log('--FHIR Resources-- Loaded');
                    populateObgynPGHForm().then(() => {
                        console.log('--PGH OBYGYN Form-- Loaded');
                        populateBreastPGHForm().then(() => {
                            console.log('--PGH Breast Form-- Loaded');
                            resolve();
                            })
                        })
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
        specrequest,
        spectyperequest,
        medical_standards_request,
        forms_request,
        users_etc_request
    ])
};


const populateSpecs = () => {
    return Spec.remove({}).then(() => {
        var spec1 = new Spec(specs[0]).save();
        var spec2 = new Spec(specs[1]).save();
        var spec3 = new Spec(specs[2]).save();
        return Promise.all([spec1, spec2, spec3]);
    });
};


const populateSpecTypes = () => {
    return SpecType.remove({}).then(() => {
        var spectype1 = new SpecType(spectypes[0]).save();
        var spectype2 = new SpecType(spectypes[1]).save();
        return Promise.all([spectype1, spectype2]);
    });
};

module.exports = {
    populateTables
} 