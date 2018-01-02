const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');

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
        it('should create user');
        it('should return 400 validation error with the field details when fields are incorrect');
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
