const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {User} = require('./../models/user');
const {users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);

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
        it('should get all users');
        it('should return 401 when user is not authenticated');
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

    describe('#GET /users/:username', () => {
        it('should get a specific user');
        it('should return 404 when user is not existing');
        it('should return 404 when user is soft deleted already');
        it('should return 401 when user is not authenticated');
    });

    describe('#PATCH /users/:username', () => {
        it('should update a user');
        it('should update fullname of a user');
        it('should not update other details of user aside from fullname');
        it('should return 401 when user is not authenticated');
    });

    describe('#DELETE /users/:username', () => {
        it('should soft delete a user');
        it('should return 404 when user is not existing');
        it('should return 404 when user is soft deleted already');
        it('should return 401 when user is not authenticated');
    });

    describe('#GET /users/me/:username', () => {
        it('should get my account');
        it('should return 401 when user is not authenticated');
        it('should return 401 when user is accessing other users');
    });

    describe('#PATCH /users/me/:username', () => {
        it('should update own user account');
        it('should return 401 when user is not authenticated');
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
