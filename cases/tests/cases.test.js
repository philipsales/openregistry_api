const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Case} = require('../../server/models/case');
const {users, populateUsers, cases, populateCases} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
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
                    expect(res.body.data[0].answers).toBeTruthy();
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
                answers: [{
                    question_key: 'FNAME',
                    question_answer: 'Marc',
                },{
                    question_key: 'MNAME',
                    question_answer: 'Penalosa',
                }, {
                    question_key: 'LNAME',
                    question_answer: 'Briones',
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
                    expect(res.body.answers.length).toBe(3);
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
                answers: [{
                    question_key: 'FNAME',
                    question_answer: 'Marc',
                },{
                    question_key: 'MNAME',
                    question_answer: 'Penalosa',
                }, {
                    question_key: 'LNAME',
                    question_answer: 'Briones',
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
                    expect(res.body.answers.length).toBe(3);
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
                    expect(res.body.answers).toBeTruthy();
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
