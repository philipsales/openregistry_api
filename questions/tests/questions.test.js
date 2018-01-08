const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');
const {Question} = require('../../server/models/question');
const {users, populateUsers} = require('../../server/tests/seed/seed');

beforeEach(populateUsers);

describe('/questions', () => {
    describe('#GET /questions', () => {
        it('should get all questions');
        it('should return 401 when user is not authenticated');
    });
    
    describe('#POST /questions', () => {
        it('should create new set of questions', (done) => {
            const seed = [{
                    "key": "GENDER",
                    "label": "What is your gender?",
                    "type": "dropdown",
                    "value": "",
                    "options": "Male|Female",
                    "required": true,
                    "order": 3
                },
                {
                    "key": "AGE",
                    "label": "What is your age?",
                    "type": "text",
                    "value": "",
                    "options": "",
                    "required": true,
                    "order": 4
                }
            ];

            request(app)
                .post('/questions')
                .set('Authorization', `JWT ${users[1].tokens[0].token}`)
                .send({data: seed})
                .expect(201)
                .expect((res) => {
                    expect(res.body.data).toBeTruthy();
                    expect(res.body.data.length).toBe(2);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    Question.findOne({key: seed[0].key}).then((question) => { 
                        expect(question).toBeTruthy();
                        done();
                    }).catch((e) => {
                        done(e);
                    });
                });
        });

        it('should return 401 when user is not authenticated', (done) => {
            const seed = [{
                "key": "GENDER",
                "label": "What is your gender?",
                "type": "dropdown",
                "value": "",
                "options": "Male|Female",
                "required": true,
                "order": 3
            },
            {
                "key": "AGE",
                "label": "What is your age?",
                "type": "text",
                "value": "",
                "options": "",
                "required": true,
                "order": 4
            }];

            request(app)
                .post('/questions')
                .set('Authorization', `JWT ${users[2].tokens[0].token}`)
                .send({data: seed})
                .expect(401)
                .end(done);
        });

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