const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../models/user');
const {users, populateUsers, permissions, populatePermissions} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populatePermissions);

describe('/api-docs', () => {
    describe('#GET /api-docs', () => {
        it('should get open api docs / swagger ui', (done) => {
            request(app)
            .get('/api-docs/')
            .expect(200)
            .end(done);
        });
    });
});

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
                    expect(res.body.data[0].fullname).toBeTruthy();
                    expect(res.body.data[0].password).toBeFalsy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app).get('/users').expect(401).end(done);
        });
    });
    
    describe('#POST /users', () => {
        it('should create user', (done) => {
            var username = 'b.kristhian.tiu3@gmail.com';
            var fullname = 'Kristhian Tiu3';
            var password = '123!';
    
            request(app)
                .post('/users')
                .send({username, fullname, password})
                .expect(201)
                .expect((res) => {
                    expect(res.body.token).toBeTruthy();
                    expect(res.body.user._id).toBeTruthy();
                    expect(res.body.user.username).toBe(username);
                    expect(res.body.user.fullname).toBe(fullname);
                    expect(res.body.user.password).toBeFalsy();
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({username}).then((user) => { 
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 400 validation error when the username is already existing', (done) => {
            var username = users[0].username;
            var fullname = 'Kristhian Tiu3';
            var password = '123!';
    
            request(app)
                .post('/users')
                .send({username, fullname, password})
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
            var fullname = 'Kristhian Tiu3';
            var password = '123!';
    
            request(app)
                .post('/users')
                .send({username, fullname, password})
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
                    expect(res.body.fullname).toBeTruthy();
                    expect(res.body.password).toBeFalsy();
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

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get(`/users/${users[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}notvalid`)
                .expect(401)
                .end(done);
        });
    });

    describe('#PATCH /users/:id', () => {
        it('should update fullname of a user', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                fullname: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.fullname).toEqual(user.fullname)
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.fullname).toBe(user.fullname);
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should not update other details of user aside from fullname', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                fullname: 'Kristhian Tiu Edited'
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

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                fullname: 'Kristhian Tiu Edited'
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
                    expect(res.body.fullname).toBeTruthy();
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

        it('should return 401 when user is accessing other users', (done) => {
            request(app)
                .get(`/users/me/${users[0]._id.toHexString()}`)
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });

    describe('#PATCH /users/me/:id', () => {
        it('should update fullname of user account', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                fullname: 'Kristhian Tiu Edited'
            }
            request(app)
                .patch(`/users/me/${hexId}`)
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .send(user)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toEqual(hexId);
                    expect(res.body.fullname).toEqual(user.fullname)
                })  
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({_id: users[0]._id}).then((updated_user) => { 
                        expect(updated_user._id).toBeTruthy();
                        expect(updated_user.fullname).toBe(user.fullname);
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

        it('should return 401 when user is not authenticated', (done) => {
            var hexId = users[0]._id.toHexString();
            var user = {
                username: 'anewemailto@gmail.com',
                fullname: 'Kristhian Tiu Edited'
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
                    expect(res.body.user.fullname).toBeTruthy();
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

describe('/questions', () => {
    describe('#GET /questions', () => {
        it('should get all questions');
        it('should return 401 when user is not authenticated');
    });
    
    describe('#POST /questions', () => {
        it('should get a specific question');
        it('should return 401 when user is not authenticated');
        it('should return 400 validation error with the field details when fields are incorrect');
    });

    describe('#GET /questions/:question_id', () => {
        it('should get a specific question');
        it('should return 401 when user is not authenticated');
        it('should return 404 when question can not be found');
        it('should return 404 when question is soft deleted');
    });

    describe('#DELETE /questions/:question_id', () => {
        it('should delete a specific question');
        it('should return 401 when user is not authenticated');
        it('should return 404 when question can not be found');
        it('should return 404 when question is already soft deleted');
    });
});

describe('/cases', () => {
    describe('#GET /cases', () => {
        it('should get all cases');
        it('should return 401 when user is not authenticated');
    });
    
    describe('#POST /cases', () => {
        it('should create and update cases');
        it('should return 401 when user is not authenticated');
        it('should return 400 validation error with the field details when fields are incorrect');
    });

    describe('#GET /cases/:case_id', () => {
        it('should get a specific case');
        it('should return 401 when user is not authenticated');
        it('should return 404 when case can not be found');
        it('should return 404 when case is soft deleted');
    });

    describe('#DELETE /cases/:case_id', () => {
        it('should delete a specific case');
        it('should return 401 when user is not authenticated');
        it('should return 404 when case is not existing');
        it('should return 404 when case is already soft deleted');
    });
});

describe('GET /permissions', () => {
    it('should get all permissions', (done) => {
        request(app)
            .get('/permissions')
            .set('Authorization', `JWT ${users[0].tokens[0].token}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.data.length).toBe(2);
                expect(res.body.data[0].perm_code).toBeTruthy();
                expect(res.body.data[0].application).toBeTruthy();
                expect(res.body.data[0].description).toBeFalsy();
            })
            .end(done);
    });

    it('should return 401 when user is not authenticated', (done) => {
        request(app).get('/permissions').expect(401).end(done);
    });
});
