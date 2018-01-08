'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Case, CaseError} = require('../server/models/case');

router.use(bodyParser.json());

router.post('/', authenticate, (req, res) => {
    var seed = _.pick(req.body, ['case_number', 'answers']);
    var instance = new Case(seed);
    instance.save().then((saved_case) => {
        return res.status(201).send(saved_case);
    }).catch((error) => {
        if (error instanceof CaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});


router.get('/', authenticate, (req, res) => {
    Case.find().then((cases) => {
        var data = cases.map((value) => value.toJSON());
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

module.exports = router