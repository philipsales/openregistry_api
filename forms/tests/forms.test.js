const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Form} = require('../../server/models/form');
const {users, populateUsers, forms, populateForms} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateForms);

describe('/forms', () => {

    describe('#POST /questions', () => {
        it('should create new forms', (done) => {
            const seed = {
                name: "My Form",
                organization: "My Organization",
                department: "My Department",
                type: "The Type",
                sections: [{
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
                }]
            };

            request(app)
                .post('/forms')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.name).toBe(seed.name);
                    expect(res.body.organization).toBe(seed.organization);
                    expect(res.body.department).toBe(seed.department);
                    expect(res.body.type).toBe(seed.type);
                    expect(res.body.sections).toBeTruthy();
                    expect(res.body.sections.length).toBeTruthy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            const seed = {
                name: "My Form",
                organization: "My Organization",
                department: "My Department",
                type: "The Type",
                sections: [{
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
                }]
            };

            request(app)
                .post('/forms')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });

    describe('#GET /forms', () => {
        it('should get all forms', (done) => {
            request(app)
                .get('/forms')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(2);
                    expect(res.body.data[0]._id).toBeTruthy();
                    expect(res.body.data[0].name).toBeTruthy();
                    expect(res.body.data[0].sections).toBeUndefined();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/forms')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#GET /forms/:id', () => {
        it('should get a specific form', (done) => {
            request(app)
                .get(`/forms/${forms[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toBeTruthy();
                    expect(res.body.organization).toBeTruthy();
                    expect(res.body.department).toBeTruthy();
                    expect(res.body.type).toBeTruthy();
                    expect(res.body.sections).toBeTruthy();
                    expect(res.body.sections.length).toBeTruthy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/forms/${forms[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });

        it('should return 404 when case can not be found', (done) => {
            request(app)
                .get(`/form/${(new ObjectID()).toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });

    describe('#PATCH /forms/:id', () => {
        it('should update a form', (done) => {
            var hexId = forms[0]._id.toHexString();
            const seed = {
                name: "My Form",
                organization: "My Organization",
                department: "My Department",
                type: "The Type",
                sections: [{
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
                }]
            };
            request(app)
                .patch(`/forms/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.name).toBe(seed.name);
                    expect(res.body.organization).toBe(seed.organization);
                    expect(res.body.department).toBe(seed.department);
                    expect(res.body.type).toBe(seed.type);
                    expect(res.body.sections).toBeTruthy();
                    expect(res.body.sections.length).toBeTruthy();
                })  
                .end(done);
        });

        it('should return 404 when form is not existing', (done) => {
            var hexId = new ObjectID();
            var seed = {
                name: "EWAN"
            }
            request(app)
                .patch(`/forms/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(404)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = forms[0]._id.toHexString();
            var seed = {
                name: "EWAN"
            }
            request(app)
                .patch(`/forms/${hexId}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });

});