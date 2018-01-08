const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Role} = require('../../server/models/role');
const {users, populateUsers, cases, populateCases} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateCases);


describe('/cases', () => {
    describe('#GET /cases', () => {
        it('should get all cases', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[0].tokens[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.length).toBe(2);
                    expect(res.body.data[0].case_number).toBeTruthy();
                    expect(res.body.data[0].answers).toBeTruthy();
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
    });
    
    describe('#POST /cases', () => {
        it('should create and update cases', (done) => {
            const seed = {
                _id: new ObjectID(),
                case_number: 2,
                answers: [{
                    question_key: 'FNAME',
                    question_answer: 'Marc',
                },{
                    question_key: 'MNAME',
                    question_answer: 'Penalosa',
                }, {
                    question_key: 'LNAME',
                    question_answer: 'Briones',
                }]
            };

            request(app)
                .post('/cases')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send(seed)
                .expect(201)
                .expect((res) => {
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.case_number).toBe(seed.case_number);
                    expect(res.body.answers.length).toBe(3);
                })
                .end(done);
        });

        it('should return 401 when user is not authenticated', (done) => {
            request(app)
                .get('/cases')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .expect(401)
                .end(done);
        });
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
