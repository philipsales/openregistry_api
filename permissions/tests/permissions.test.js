const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Permission} = require('../../server/models/permission');
const {users, populateUsers, permissions, populatePermissions} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populatePermissions);

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
                expect(res.body.data[0].module).toBeTruthy();
                expect(res.body.data[0].description).toBeFalsy();
            })
            .end(done);
    });

    it('should return 401 when user is not authenticated', (done) => {
        request(app).get('/permissions').expect(401).end(done);
    });
});