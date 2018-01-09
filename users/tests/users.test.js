const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {User, UserError} = require('../../server/models/user');
const {users, populateUsers, populatePermissions, populateRoles} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populatePermissions);
beforeEach(populateRoles);


describe('/users', () => {
    describe('#GET /users', () => {
        it('should get all users', (done) => {
            request(app)
                .get('/users')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(2);
                    expect(res.body.data[0].username).toBeTruthy();
                    expect(res.body.data[0].first_name).toBeTruthy();
                    expect(res.body.data[0].password).toBeFalsy();
                    expect(res.body.data[0].roles).toBeFalsy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app).get('/users').expect(401).end(done);
        });
    });
    
    describe('#POST /users', () => {
        it('should create user', (done) => {
            var seed = {
                username : 'b.kristhian.tiu3@gmail.com',
                first_name : 'Kristhian',
                middle_name : 'Briones',
                last_name : 'Tiu',
                password : '123!',
                gender: 'M',
                email: 'ewan@email.com',
                mobile_number: 'some number'
            };
    
            request(app)
                .post('/users')
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body.token).toBeTruthy();
                    expect(res.body.user._id).toBeTruthy();
                    expect(res.body.user.username).toBe(seed.username);
                    expect(res.body.user.first_name).toBe(seed.first_name);
                    expect(res.body.user.middle_name).toBe(seed.middle_name);
                    expect(res.body.user.last_name).toBe(seed.last_name);
                    expect(res.body.user.gender).toBe(seed.gender);
                    expect(res.body.user.email).toBe(seed.email);
                    expect(res.body.user.mobile_number).toBe(seed.mobile_number);
                    expect(res.body.user.password).toBeFalsy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({username: seed.username}).then((user) => { 
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(seed.password);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 validation error when the username is already existing', (done) => {
            var username = users[0].username;
            var first_name = 'Kristhian Tiu3';
            var password = '123!';
    
            request(app)
                .post('/users')
                .send({username, first_name, password})
                .expect(400)
                .expect((res) => {
                    expect(res.body.code).toBe(400);
                    expect(res.body.errors).toBeTruthy();
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0].field).toBe('username');
                    expect(res.body.errors[0].error).toBe('duplicate');
                    expect(res.body.userMessage).toBeTruthy();
                    expect(res.body.internalMessage).toBeTruthy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.find({username}).then((user) => { 
                        expect(user.length).toBe(1);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 validation error on invalid email address', (done) => {
            var username = 'not-a-valid-email';
            var first_name = 'Kristhian Tiu3';
            var password = '123!';
    
            request(app)
                .post('/users')
                .send({username, first_name, password})
                .expect(400)
                .expect((res) => {
                    expect(res.body.code).toBe(400);
                    expect(res.body.errors).toBeTruthy();
                    expect(res.body.errors.length).toBe(1);
                    expect(res.body.errors[0].field).toBe('username');
                    expect(res.body.errors[0].error).toBe('invalid email address');
                    expect(res.body.userMessage).toBeTruthy();
                    expect(res.body.internalMessage).toBeTruthy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.find({username}).then((user) => { 
                        expect(user.length).toBe(0);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });
    });

    describe('#GET /users/:id', () => {
        it('should get a specific user', (done) => {
            request(app)
                .get(`/users/${users[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.username).toBeTruthy();
                    expect(res.body.first_name).toBeTruthy();
                    expect(res.body.password).toBeFalsy();
                    expect(res.body.roles).toBeTruthy();
                })
                .end(done);
        });

        it('should return 404 when user is not existing', (done) => {
            request(app)
                .get(`/users/${users[0]._id.toHexString()}notvalid`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 when user is existing but deleted', (done) => {
            request(app)
                .get(`/users/${users[2]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/users/${users[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}notvalid`)
                .expect(401)
                .end(done);
        });
    });

    describe('#PATCH /users/:id', () => {
        it('should update first_name of a user', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.first_name).toEqual(user.first_name)
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.first_name).toBe(user.first_name);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should update middlename, lastname, gender, email, mobile number of a user', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                last_name: 'Lastname',
                middle_name: 'MiddleName',
                gender: 'M',
                email: 'email@email.com',
                mobile_number: 'mobilenumber'
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.last_name).toEqual(user.last_name);
                    expect(res.body.middle_name).toEqual(user.middle_name);
                    expect(res.body.gender).toEqual(user.gender);
                    expect(res.body.email).toEqual(user.email);
                    expect(res.body.mobile_number).toEqual(user.mobile_number);
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.last_name).toBe(user.last_name);
                        expect(updated_user.middle_name).toEqual(user.middle_name);
                        expect(updated_user.gender).toEqual(user.gender);
                        expect(updated_user.email).toEqual(user.email);
                        expect(updated_user.mobile_number).toEqual(user.mobile_number);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should not update other details of user aside from first_name', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.username).not.toBe(user.username);
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.username).not.toBe(user.username);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should update roles of user', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                roles: ['Admin', 'Guest']
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.roles.length).toBe(2)
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.roles).toContain('Admin');
                        expect(updated_user.roles).toContain('Guest');
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 if some roles are not existent', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                roles: ['Admin', 'Ewan']
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(400)
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.roles.length).toBe(users[0].roles.length);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 404 when user is already deleted', (done) => {
            var hexId = users[2]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(user)
                .expect(404)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}notvalid`)
                .send(user)
                .expect(401)
                .end(done);
        });
    });

    describe('#DELETE /users/:id', () => {
        it('should soft delete a user', (done) => {
            var hexId = users[1]._id.toHexString();
            request(app)
                .delete(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)    
                .expect((res) => {
                    expect(res.body._id).toBe(hexId);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.find({
                        _id: hexId,
                        isDeleted: false
                    }).then((user) => {
                        expect(user).toEqual([]);
                        return done();
                    }).catch((err) => done(err));
                });
        });

        it('should return 404 when user is not existing', (done) => {
            var hexId = new ObjectID();
            request(app)
                .delete(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(404) 
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.find({
                        _id: hexId,
                        isDeleted: false
                    }).then((user) => {
                        expect(user).toEqual([]);
                        return done();
                    }).catch((err) => done(err));
                });
        });

        it('should return 404 when user is already deleted', (done) => {
            var hexId = users[2]._id.toHexString();;
            request(app)
                .delete(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(404) 
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = users[0]._id.toHexString();
            request(app)
                .delete(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}invalid`)
                .expect(401) 
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    User.find({
                        _id: hexId,
                        isDeleted: false
                    }).then((user) => {
                        expect(user).toBeTruthy();
                        return done();
                    }).catch((err) => done(err));
                });
        });
    });

    describe('#GET /users/me/:id', () => {
        it('should get my account', (done) => {
            request(app)
                .get(`/users/me/${users[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.username).toBeTruthy();
                    expect(res.body.first_name).toBeTruthy();
                    expect(res.body.password).toBeFalsy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/users/me/${users[0]._id.toHexString()}`)
                .expect(401)
                .end(done);
        });

        it('should return 401 when user is deleted', (done) => {
            request(app)
                .get(`/users/me/${users[2]._id.toHexString()}`)
                .expect(401)
                .end(done);
        });

        it('should return 401 when user is accessing other users', (done) => {
            request(app)
                .get(`/users/me/${users[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#PATCH /users/me/:id', () => {
        it('should update first_name of user account', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/me/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.first_name).toEqual(user.first_name)
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.first_name).toBe(user.first_name);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should update middlename, lastname, gender, email, mobile number of my account', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                last_name: 'Lastname',
                middle_name: 'MiddleName',
                gender: 'M',
                email: 'email@email.com',
                mobile_number: 'mobilenumber'
            }
            request(app)
                .patch(`/users/me/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.last_name).toEqual(user.last_name);
                    expect(res.body.middle_name).toEqual(user.middle_name);
                    expect(res.body.gender).toEqual(user.gender);
                    expect(res.body.email).toEqual(user.email);
                    expect(res.body.mobile_number).toEqual(user.mobile_number);
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.last_name).toBe(user.last_name);
                        expect(updated_user.middle_name).toEqual(user.middle_name);
                        expect(updated_user.gender).toEqual(user.gender);
                        expect(updated_user.email).toEqual(user.email);
                        expect(updated_user.mobile_number).toEqual(user.mobile_number);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should update password of user account', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                password: 'new-password'
            }
            request(app)
                .patch(`/users/me/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        var username = updated_user.username;
                        var password = user.password;
                        expect(updated_user.password).not.toBe(user.password);
                        request(app)
                            .post('/users/token')
                            .send({username, password})
                            .expect(200)
                            .end(done);    
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 401 when user is already deleted', (done) => {
            var hexId = users[2]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/me/${hexId}`)
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send(user)
                .expect(401)
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                first_name: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/me/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}notvalid`)
                .send(user)
                .expect(401)
                .end(done);
        });
    });

    describe('#POST /users/token', () => {
        it('should login user and return auth token', (done) => {
            var username = users[0].username;
            var password = users[0].password;
            request(app)
                .post('/users/token')
                .send({username, password})
                .expect(200)
                .expect((res) => {
                    expect(res.body.token).toBeTruthy();
                    expect(res.body.user._id).toBeTruthy();
                    expect(res.body.user.username).toBe(username);
                    expect(res.body.user.first_name).toBeTruthy();
                    expect(res.body.user.password).toBeFalsy();
                })
                .end((err, res) => {
                    if(err) {
                        return done(err)
                    }
    
                    User.findById(users[0]._id).then((user) =>{
                        expect(user.toObject().tokens[1]).toMatchObject({
                            access: 'auth',
                            token: res.body.token
                        });
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });
    
        it('should return 400 if invalid credentials', (done) => {
            request(app)
            .post('/users/token')
            .send({
                username: users[1].username,
                password: (users[1].password + 'no')
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.token).toBeFalsy();
            })
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
    
                User.findById(users[1]._id).then((user) =>{
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => {
                    done(e);
                });
            });
        });

        it('should return 404 if user is deleted', (done) => {
            request(app)
            .post('/users/token')
            .send({
                username: users[2].username,
                password: (users[2].password)
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.token).toBeFalsy();
            })
            .end((err, res) => {
                if(err) {
                    return done(err)
                }
    
                User.findById(users[2]._id).then((user) =>{
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => {
                    done(e);
                });
            });
        });
    });

    describe('#DELETE /users/token', () => {
        it('should remove auth token on logout', (done) => {
            var token = users[0].tokens[0].token;
            request(app)
                .delete('/users/token')
                .set('Authorization', `JWT ${token}`)
                .send()
                .expect(200)
                .end((err, res) => {
                    if(err) {
                        return done(err)
                    }
        
                    User.findById(users[0]._id).then((user) =>{
                        expect(user.tokens[0]).toBeFalsy();
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 401 if token is invalid', (done) => {
            var token = users[0].tokens[0].token + 'invalid';
            request(app)
                .delete('/users/token')
                .set('Authorization', `JWT ${token}`)
                .send()
                .expect(401)
                .end((err, res) => {
                    if(err) {
                        return done(err)
                    }
        
                    User.findById(users[0]._id).then((user) =>{
                        expect(user.tokens.length).toBe(1);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });
    });
});