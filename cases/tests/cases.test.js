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
                    expect(res.body.data[0].case_number).toBeDefined();
                    expect(res.body.data[0].date_created).toBeDefined();
                    expect(res.body.data[0].diagnosis).toBeDefined();
                    expect(res.body.data[0].forms).toBeDefined();
                    expect(res.body.data[0].forms[0].form_id).toBeDefined();
                    expect(res.body.data[0].forms[0].form_name).toBeDefined();
                    expect(res.body.data[0].forms[0].date_created).toBeDefined();
                    expect(res.body.data[0].forms[0].answers).toBeUndefined();
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
                case_number: '4',
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
                    expect(res.body._id).toBeDefined();
                    expect(res.body.case_number).toBe(seed.case_number);
                    expect(res.body.diagnosis).toBeDefined();
                    expect(res.body.date_created).toBeDefined();
                    expect(res.body.forms.length).toBe(2);
                    expect(res.body.forms[0].form_id).toBeDefined();
                    expect(res.body.forms[0].form_name).toBeDefined();
                    expect(res.body.forms[0].date_created).toBeDefined();
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

        

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#PATCH /cases/:id', () => {
        it('should update existing case', (done) => {
            const seed = {
                _id: new ObjectID(),
                case_number: '1',
                date_created: (new Date()).getTime(),
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
            
            var hexId = cases[0]._id.toHexString();
            request(app)
                .patch(`/cases/${hexId}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.case_number).toBe(seed.case_number);
                    expect(res.body.diagnosis).toBe(seed.diagnosis);
                    expect(res.body.date_created).toBe(seed.date_created);
                    expect(res.body.forms.length).toBe(1);
                    expect(res.body.forms[0].date_created).toBeDefined();
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
    });

    describe('#GET /cases/:id', () => {
        it('should get a specific case', (done) => {
            request(app)
                .get(`/cases/${cases[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.case_number).toBeDefined();
                    expect(res.body.diagnosis).toBeDefined();
                    expect(res.body.date_created).toBeDefined();
                    expect(res.body.forms).toBeDefined();
                    expect(res.body.forms.length).toBe(2);
                    expect(res.body.forms[0].form_id).toBeDefined();
                    expect(res.body.forms[0].form_name).toBeDefined();
                    expect(res.body.forms[0].date_created).toBeDefined();
                    expect(res.body.forms[0].answers).toBeDefined();
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

                    Case.find({is_deleted: false}).then((cases) => { 
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

    describe('#GET /cases/:caseid/forms/:id', () => {
        it('should get specific form inside a case', (done) => {
            const caseid = cases[0]._id.toHexString();
            const formid = cases[0].forms[0]._id.toHexString();
            request(app)
                .get(`/cases/${caseid}/forms/${formid}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.form_id).toBeDefined();
                    expect(res.body.form_name).toBeDefined();
                    expect(res.body.date_created).toBeDefined();
                    expect(res.body.answers).toBeDefined();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            const caseid = cases[0]._id.toHexString();
            const formid = cases[0].forms[0]._id.toHexString();
            request(app)
                .get(`/cases/${caseid}/forms/${formid}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });

        it('should return 404 when form inside case can not be found', (done) => {
            const caseid = cases[0]._id.toHexString();
            const formid = cases[1].forms[0]._id.toHexString();
            request(app)
                .get(`/cases/${caseid}/forms/${formid}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });
});
