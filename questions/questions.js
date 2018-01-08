'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Question, QuestionError} = require('../server/models/question');

router.use(bodyParser.json());

router.post('/', authenticate, (req, res) => {
    var questions = _.pick(req.body, ['data']);
    var requests = [];

    Question.remove({}).then(() => {
        for(var i=0; i < questions.data.length; ++i){
            requests.push(new Question(questions.data[i]).save());
        }
        return Promise.all(requests);
    }).then(() => {
        Question.find().then((data) => {
            return res.status(201).send({data});
        });
    }, (error) => {
        return Promise.reject(error);
    }).catch((error) => {
        if (error instanceof QuestionError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});


router.get('/', authenticate, (req, res) => {
    Question.find().then((questions) => {
        var data = questions.map((question) => question.toJSON());
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

module.exports = router