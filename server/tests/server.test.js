const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

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