const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Form} = require('../../server/models/form');
const {users, populateUsers} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);

describe('/forms', () => {
    describe('#POST /questions', () => {
        it('should create new forms', (done) => {
            const seed = {
                name: "My Form",
                organization: "My Organization",
                department: "My Department",
                type: "The Type",
                sections: {
                    key: "section-key",
                    name: "section-name",
                    order: 1,
                    questions: [{
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
                }
            };

            request(app)
                .post('/forms')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    console.log(res.body);
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.name).toBe(seed.name);
                    expect(res.body.organization).toBe(seed.organization);
                    expect(res.body.department).toBe(seed.department);
                    expect(res.body.type).toBe(seed.type);
                    expect(res.body.sections).toBeTruthy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            const seed = {
                name: "My Form",
                organization: "My Organization",
                department: "My Department",
                type: "The Type",
                sections: {
                    key: "section-key",
                    name: "section-name",
                    order: 1,
                    questions: [{
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
                }
            };

            request(app)
                .post('/forms')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });
});