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
    
    describe('#POST /roles', () => {
        it('should get a specific roles');
        it('should return 401 when user is not authenticated');
        it('should return 400 validation error with the field details when fields are incorrect');
    });

    describe('#GET /roles/:id', () => {
        it('should get a specific role');
        it('should return 401 when user is not authenticated');
        it('should return 404 when role can not be found');
        it('should return 404 when role is soft deleted');
    });

    describe('#DELETE /roles/:id', () => {
        it('should delete a specific role');
        it('should return 401 when user is not authenticated');
        it('should return 404 when role can not be found');
        it('should return 404 when role is already soft deleted');
    });
});