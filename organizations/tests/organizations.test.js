const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Organization, OrganizationError} = require('../../server/models/organization');
const {users, populateUsers, organizations, populateOrganizations} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateOrganizations);


describe('/organizations', () => {
    describe('#GET /organizations', () => {
        it('should get all organizations', (done) => {
            request(app)
                .get('/organizations')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(1);
                    expect(res.body.data[0]._id).toBeTruthy();
                    expect(res.body.data[0].name).toBeTruthy();
                    expect(res.body.data[0].isDeleted).toBeUndefined();
                })
                .end(done);
        });
    });

    describe('#GET /organizations/:id', () => {
        it('should get a specific organization', (done) => {
            request(app)
                .get(`/organizations/${organizations[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.name).toBeTruthy();
                    expect(res.body.isDeleted).toBeUndefined();
                })
                .end(done);
        });

        it('should get a 404 if organization is already soft deleted', (done) => {
            request(app)
                .get(`/organizations/${organizations[1]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 when organization can not be found', (done) => {
            var id = new ObjectID();
            request(app)
                .get(`/organizations/${id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });

    describe('#POST /organizations', () => {
        it('should create an organization', (done) => {
            var seed = {
                name : 'Organization1EWAN'
            };
    
            request(app)
                .post('/organizations')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
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

                    Organization.findOne({name: seed.name}).then((organization) => { 
                        expect(organization._id).toBeTruthy();
                        expect(organization.name).toBe(seed.name);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 validation error when organization already exists', (done) => {
            var seed = {
                name : 'SEAOIL'
            };

            request(app)
                .post('/organizations')
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

                    Organization.find().then((org) => { 
                        expect(org.length).toBe(2);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 if duplicate organization', (done) => {
            var hexId = organizations[0]._id.toHexString();
            var seed = {
                name : 'SEAOIL'
            };
            request(app)
                .post(`/organizations`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(400)
                .expect((res) => {
                    //console.log(res);
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

        it('should return 400 if unauthorized', (done) => {
            var hexId = organizations[0]._id.toHexString();
            var seed = {
                name : 'SEAOIL2'
            };
            request(app)
                .post(`/organizations`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });


    describe('#PATCH /roles/:id', () => {
        it('should update name of an organization', (done) => {
            var hexId = organizations[0]._id.toHexString();
            var seed = {
                name: 'NEW NAME2'
            }
            request(app)
                .patch(`/organizations/${hexId}`)
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

                    Organization.findOne({_id: organizations[0]._id}).then((updated_org) => { 
                        expect(updated_org._id).toBeTruthy();
                        expect(updated_org.name).toBe(seed.name);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 if organization name is already taken', (done) => {
            var hexId = organizations[0]._id.toHexString();
            var seed = {
                name: 'BEARBRAND'
            }
            request(app)
                .patch(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(400)
                .end(done);
        });

        it('should return 404 when organization is not existing', (done) => {
            var hexId = new ObjectID();
            var seed = {
                name: "EWAN"
            }
            request(app)
                .patch(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(seed)
                .expect(404)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = organizations[0]._id.toHexString();
            var seed = {
                name: "EWAN"
            }
            request(app)
                .patch(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });
    });

    describe('#DELETE /organizations/:id', () => {
        it('should soft delete an organization', (done) => {
            var hexId = organizations[0]._id.toHexString();
            request(app)
                .delete(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)    
                .expect((res) => {
                    expect(res.body._id).toBe(hexId);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Organization.find({
                        _id: hexId,
                        isDeleted: false
                    }).then((org) => {
                        expect(org).toEqual([]);
                        return done();
                    }).catch((err) => done(err));
                });
        });

        it('should return 404 when organization is not existing', (done) => {
            var hexId = new ObjectID();
            request(app)
                .delete(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(404) 
                .end(done);
        });

        it('should return 404 when organization is already deleted', (done) => {
            var hexId = organizations[1]._id.toHexString();;
            request(app)
                .delete(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404) 
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = organizations[0]._id.toHexString();
            request(app)
                .delete(`/organizations/${hexId}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401) 
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Organization.find({
                        _id: hexId,
                        isDeleted: false
                    }).then((org) => {
                        expect(org).toBeTruthy();
                        return done();
                    }).catch((err) => done(err));
                });
        });
    });
});