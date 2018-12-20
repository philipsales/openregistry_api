'use strict'

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Department} = require('../server/models/department');

router.use(bodyParser.json());

router.get('/', (req, res) => {
    Department.find().then(departments => 
        res.status(200).send(departments), 
        error => res.status(400).send(error));
});

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['name', 'description']);
    var department = new Department(body);
    department.save().then(new_department => 
        res.status(200).send(new_department),
        error => res.status(400).send(error)
    );
});

module.exports = router