const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Case} = require('../../server/models/case');
const {users, populateUsers, forms, populateForms, cases, populateCases} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateForms);
beforeEach(populateCases);


describe('/cases', () => {
    describe('#GET /cases', () => {
        it('should get all cases', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(2);
                    expect(res.body.data[0].case_number).toBeTruthy();
                    expect(res.body.data[0].diagnosis).toBeTruthy();
                    expect(res.body.data[0].forms).toBeTruthy();
                    expect(res.body.data[0].forms[0].form_id).toBeTruthy();
                    expect(res.body.data[0].forms[0].form_name).toBeTruthy();
                    expect(res.body.data[0].forms[0].answers).toBeFalsy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });
    
    describe('#POST /cases', () => {
        it('should create new case', (done) => {
            const seed = {
                _id: new ObjectID(),
                case_number: 4,
                diagnosis: '',
                forms: [{
                    form_id: forms[0]._id.toHexString(),
                    form_name: forms[0].name,
                    answers: [{
                        question_key: 'GENDER',
                        question_answer: 'Male',
                    },{
                        question_key: 'AGE',
                        question_answer: '21',
                    }]
                },{
                    form_id: forms[1]._id.toHexString(),
                    form_name: forms[1].name,
                    answers: [{
                        question_key: 'NAME',
                        question_answer: 'Marc',
                    },{
                        question_key: 'HOBBY',
                        question_answer: 'Penalosa',
                    }]
                }]
            };

            request(app)
                .post('/cases')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.case_number).toBe(seed.case_number);
                    expect(res.body.forms.length).toBe(2);
                    expect(res.body.forms[0].form_id).toBeTruthy();
                    expect(res.body.forms[0].form_name).toBeTruthy();
                    expect(res.body.forms[0].answers.length).toBe(2);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Case.find().then((cases) => { 
                        expect(cases.length).toBe(4);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should update existing case', (done) => {
            const seed = {
                _id: new ObjectID(),
                case_number: 1,
                diagnosis: '',
                forms: [{
                    form_id: forms[0]._id.toHexString(),
                    form_name: forms[0].name,
                    answers: [{
                        question_key: 'GENDER',
                        question_answer: 'Male',
                    }]
                }]
            };

            request(app)
                .post('/cases')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.case_number).toBe(seed.case_number);
                    expect(res.body.forms.length).toBe(1);
                    expect(res.body.forms[0].answers.length).toBe(1);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Case.find().then((cases) => { 
                        expect(cases.length).toBe(3);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#GET /cases/:id', () => {
        it('should get a specific case', (done) => {
            request(app)
                .get(`/cases/${cases[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.case_number).toBeTruthy();
                    expect(res.body.forms).toBeTruthy();
                    expect(res.body.forms.length).toBe(2);
                    expect(res.body.forms[0].form_id).toBeTruthy();
                    expect(res.body.forms[0].form_name).toBeTruthy();
                    expect(res.body.forms[0].answers).toBeTruthy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/cases/${cases[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });

        it('should return 404 when case can not be found', (done) => {
            request(app)
                .get(`/cases/${(new ObjectID()).toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 when case is soft deleted', (done) => {
            request(app)
                .get(`/cases/${cases[2]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });

    describe('#DELETE /cases/:case_id', () => {
        it('should delete a specific case', (done) => {
            request(app)
                .delete(`/cases/${cases[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Case.find({isDeleted: false}).then((cases) => { 
                        expect(cases.length).toBe(1);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 404 when case is already soft deleted', (done) => {
            request(app)
                .delete(`/cases/${cases[2]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });

        it('should return 404 when case is not existing', (done) => {
            request(app)
                .get(`/cases/${(new ObjectID()).toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 when case is already soft deleted', (done) => {
            request(app)
                .delete(`/cases/${cases[2]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });
});
