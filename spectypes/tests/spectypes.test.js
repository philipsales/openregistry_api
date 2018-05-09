const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {SpecType} = require('../../server/models/spectype');
const {users, populateUsers, spectypes, populateSpecTypes} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateSpecTypes);

describe('/spectypes', () => {
    describe('#GET /spectypes', () => {
        it('should get all spectypes', (done) => {
            request(app)
                .get('/spectypes')
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
                .get('/spectypes')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#GET /spectypes/:id', () => {
        it('should get a SpecTypeific SpecType', (done) => {
            request(app)
                .get(`/spectypes/${spectypes[0]._id.toHexString()}`)
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
                .get(`/spectypes/${spectypes[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
        it('should return 404 when SpecType can not be found', (done) => {
            var id = new ObjectID();
            request(app)
                .get(`/spectypes/${id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });

    describe('#POST /spectypes', () => {
        it('should create a SpecType', (done) => {
            const seed = {
                name: 'Test'
            };

            request(app)
                .post('/spectypes')
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

                    SpecType.findOne({name: seed.name}).then((this_SpecType) => { 
                        expect(this_SpecType).toBeTruthy();
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
                .post('/spectypes')
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
                .post('/spectypes')
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

                    SpecType.find().then((this_SpecType) => { 
                        expect(this_SpecType.length).toBe(3);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });
    });

    describe('#PATCH /spectypes/:id', () => {
        it('should update name of a SpecType', (done) => {
            var hexId = spectypes[0]._id.toHexString();
            var seed = {
                name: 'NEW'
            }
            request(app)
                .patch(`/spectypes/${hexId}`)
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

                    SpecType.findOne({_id: spectypes[0]._id}).then((updated_SpecType) => { 
                        expect(updated_SpecType._id).toBeTruthy();
                        expect(updated_SpecType.name).toBe(seed.name);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });


        it('should return 400 if duplicate name', (done) => {
            var hexId = spectypes[0]._id.toHexString();
            var seed = {
                name: 'FEET'
            }
            request(app)
                .patch(`/spectypes/${hexId}`)
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

        it('should return 404 when SpecType is not existing', (done) => {
            var hexId = new ObjectID();
            var seed = {
                name: 'EWAN'
            }
            request(app)
                .patch(`/spectypes/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(404)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = spectypes[0]._id.toHexString();
            var seed = {
                name: 'ARUYY'
            }
            request(app)
                .patch(`/spectypes/${hexId}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });
});