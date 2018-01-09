const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Permission} = require('./../../models/permission');
const {Role} = require('./../../models/role');
const {Question} = require('./../../models/question');
const {Case} = require('./../../models/case');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();

const users = [{
    _id: userOneId,
    username: 'b.kristhian.tiu@gmail.com',
    first_name: 'Kristhian',
    last_name: 'Tiu',
    middle_name: 'Briones',
    password: 'userOnePass',
    isDeleted: false,
    roles: ['Admin'],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    username: 'b.kristhian.tiu2@gmail.com',
    first_name: 'Chan',
    last_name: 'Tiu',
    middle_name: 'Briones',
    password: 'userTwoPass',
    isDeleted: false,
    roles: [],
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }],
},{
    _id: userThreeId,
    username: 'angelobriones@gmail.com',
    first_name: 'Angelo',
    last_name: 'Briones',
    middle_name: 'Penalosa',
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

const roles = [{
    _id: new ObjectID(),
    rolename: 'Admin',
    permissions: ['add_user', 'delete_user'],
    isActive: true
}, {
    _id: new ObjectID(),
    rolename: 'Guest',
    permissions: [],
    isActive: false
}];

const questions = [{
    "key": "FNAME",
    "label": "What is your first name?",
    "type": "text",
    "value": "",
    "options": "",
    "required": true,
    "order": 1
},
{
    "key": "MNAME",
    "label": "What is your middle name?",
    "type": "text",
    "value": "",
    "options": "",
    "required": true,
    "order": 2
},
{
    "key": "LNAME",
    "label": "What is your last name?",
    "type": "text",
    "value": "",
    "options": "",
    "required": true,
    "order": 3
}];

const cases = [{
    _id: new ObjectID(),
    case_number: 1,
    answers: [{
        question_key: 'FNAME',
        question_answer: 'Kristhian',
    },{
        question_key: 'MNAME',
        question_answer: 'Briones',
    }, {
        question_key: 'LNAME',
        question_answer: 'Tiu',
    }]
}, {
    _id: new ObjectID(),
    case_number: 2,
    answers: [{
        question_key: 'FNAME',
        question_answer: 'Analee',
    },{
        question_key: 'MNAME',
        question_answer: 'de leon',
    }, {
        question_key: 'LNAME',
        question_answer: 'Divinagracia',
    }]
},
{
    _id: new ObjectID(),
    case_number: 3,
    answers: [{
        question_key: 'FNAME',
        question_answer: 'sadsad',
    },{
        question_key: 'MNAME',
        question_answer: 'asd asdasd',
    }, {
        question_key: 'LNAME',
        question_answer: 'asdasd',
    }],
    isDeleted: true
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

const populateRoles = (done) => {
    Role.remove({}).then(() => {
        var roleOne = new Role(roles[0]).save();
        var roleTwo = new Role(roles[1]).save();
        return Promise.all([roleOne, roleTwo])
    }).then(() => done());
};

const populateQuestions = (done) => {
    Question.remove({}).then(() => {
        var requests = [];
        questions.forEach((element) => {
            requests.push(new Question(element).save());
        });
        return Promise.all(requests)
    }).then(() => done());
};


const populateCases = (done) => {
    Case.remove({}).then(() => {
        var caseOne = new Case(cases[0]).save();
        var caseTwo = new Case(cases[1]).save();
        var caseThree = new Case(cases[2]).save();
        return Promise.all([caseOne, caseTwo, caseThree])
    }).then(() => done());
};

module.exports = {
    users,
    populateUsers,
    permissions,
    populatePermissions,
    roles,
    populateRoles,
    questions,
    populateQuestions,
    cases,
    populateCases
} 