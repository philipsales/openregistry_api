const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Role} = require('../../server/models/role');
const {users, populateUsers, permissions, populatePermissions, roles, populateRoles} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populatePermissions);
beforeEach(populateRoles);

describe('/roles', () => {
    describe('#GET /roles', () => {
        it('should get all roles', (done) => {
            request(app)
                .get('/roles')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(2);
                    expect(res.body.data[0]._id).toBeTruthy();
                    expect(res.body.data[0].rolename).toBeTruthy();
                    expect(res.body.data[0].permissions).toBeFalsy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/roles')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#GET /roles/:id', () => {
        it('should get a specific role', (done) => {
            request(app)
                .get(`/roles/${roles[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.rolename).toBeTruthy();
                    expect(res.body.permissions).toBeTruthy();
                })
                .end(done);
        });
        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/roles/${roles[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
        it('should return 404 when role can not be found', (done) => {
            var id = new ObjectID();
            request(app)
                .get(`/roles/${id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });
    });

    describe('#POST /roles', () => {
        it('should create a role', (done) => {
            const seed = {
                rolename: 'Test',
                permissions: ['add_user', 'delete_user'],
                isActive: true
            };

            request(app)
                .post('/roles')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.rolename).toBe(seed.rolename);
                    expect(res.body.isActive).toBe(seed.isActive);
                    expect(res.body.permissions).toBeTruthy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Role.findOne({rolename: seed.rolename}).then((role) => { 
                        expect(role).toBeTruthy();
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 401 when user is not authenticated', (done) => {
            const seed = {
                rolename: 'Test',
                permissions: ['add_user', 'delete_user'],
                isActive: true
            };

            request(app)
                .post('/roles')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(seed)
                .expect(401)
                .end(done);
        });

        it('should return 400 validation error when rolename already exists', (done) => {
            const seed = {
                rolename: 'Admin',
                permissions: ['add_user', 'delete_user'],
                isActive: true
            };

            request(app)
                .post('/roles')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(400)
                .expect((res) => {
                    expect(res.body.code).toBe(400);
                    expect(res.body.errors).toBeTruthy();
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0].field).toBe('rolename');
                    expect(res.body.errors[0].error).toBe('duplicate');
                    expect(res.body.userMessage).toBeTruthy();
                    expect(res.body.internalMessage).toBeTruthy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Role.find().then((role) => { 
                        expect(role.length).toBe(2);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });


        it('should return 400 validation error when one of the permissions does not exist', (done) => {
            const seed = {
                rolename: 'Test',
                permissions: ['add_user', 'delete_user', 'ewan'],
                isActive: true
            };

            request(app)
                .post('/roles')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(400)
                .expect((res) => {
                    expect(res.body.code).toBe(400);
                    expect(res.body.errors).toBeTruthy();
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0].field).toBe('permissions');
                    expect(res.body.errors[0].error).toBe('invalid');
                    expect(res.body.userMessage).toBeTruthy();
                    expect(res.body.internalMessage).toBeTruthy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Role.find().then((role) => { 
                        expect(role.length).toBe(2);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });
    });

    describe('#PATCH /roles/:id', () => {
        it('should update rolename of a role');
        it('should update isActive of a role');
        it('should update permissions');
        it('should return 401 when user is not authenticated');
    });
});