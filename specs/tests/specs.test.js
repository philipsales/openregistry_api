const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Spec} = require('../../server/models/spec');
const {users, populateUsers, specs, populateSpecs} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateSpecs);
// beforeEach(populatespecs);

describe('/specs', () => {
    describe('#GET /specs', () => {
        it('should get all specs', (done) => {
            request(app)
                .get('/specs')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(2);
                    expect(res.body.data[0]._id).toBeTruthy();
                    expect(res.body.data[0].name).toBeTruthy();
                    expect(res.body.data[0].is_deleted).toBeUndefined();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/specs')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#GET /specs/:id', () => {
        it('should get a specific spec', (done) => {
            request(app)
                .get(`/specs/${specs[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.name).toBeTruthy();
                })
                .end(done);
        });
        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/specs/${specs[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
        it('should return 404 when spec can not be found', (done) => {
            var id = new ObjectID();
            request(app)
                .get(`/specs/${id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });

    describe('#POST /specs', () => {
        it('should create a spec', (done) => {
            const seed = {
                name: 'Test'
            };

            request(app)
                .post('/specs')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.name).toBe(seed.name);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Spec.findOne({name: seed.name}).then((this_spec) => { 
                        expect(this_spec).toBeTruthy();
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 401 when user is not authenticated', (done) => {
            const seed = {
                name: 'Test2'
            };

            request(app)
                .post('/specs')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });

        it('should return 400 validation error when name already exists', (done) => {
            const seed = {
                name: 'HEAD'
            };

            request(app)
                .post('/specs')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(400)
                .expect((res) => {
                    expect(res.body.code).toBe(400);
                    expect(res.body.errors).toBeTruthy();
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0].field).toBe('name');
                    expect(res.body.errors[0].error).toBe('duplicate');
                    expect(res.body.userMessage).toBeTruthy();
                    expect(res.body.internalMessage).toBeTruthy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Spec.find().then((this_spec) => { 
                        expect(this_spec.length).toBe(3);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });
    });

    describe('#PATCH /specs/:id', () => {
        it('should update name of a spec', (done) => {
            var hexId = specs[0]._id.toHexString();
            var seed = {
                name: 'NEW'
            }
            request(app)
                .patch(`/specs/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.name).toEqual(seed.name)
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Spec.findOne({_id: specs[0]._id}).then((updated_spec) => { 
                        expect(updated_spec._id).toBeTruthy();
                        expect(updated_spec.name).toBe(seed.name);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });


        it('should return 400 if duplicate name', (done) => {
            var hexId = specs[0]._id.toHexString();
            var seed = {
                name: 'FEET'
            }
            request(app)
                .patch(`/specs/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(400)
                .expect((res) => {
                    expect(res.body.code).toBe(400);
                    expect(res.body.errors).toBeTruthy();
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0].field).toBe('name');
                    expect(res.body.errors[0].error).toBe('duplicate');
                    expect(res.body.userMessage).toBeTruthy();
                    expect(res.body.internalMessage).toBeTruthy();
                })
                .end(done);
        });

        it('should return 404 when spec is not existing', (done) => {
            var hexId = new ObjectID();
            var seed = {
                name: 'EWAN'
            }
            request(app)
                .patch(`/specs/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(404)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = specs[0]._id.toHexString();
            var seed = {
                name: 'ARUYY'
            }
            request(app)
                .patch(`/specs/${hexId}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });
});