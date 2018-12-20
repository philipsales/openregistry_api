'use strict'

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/', (req, res) => {
    return res.status(200).send([
        {id: 0, name: 'General Surgery Department'},
        {id: 1, name: 'Obstetric Gynecology Department'},
        {id: 2, name: 'Institute of Biology'}
    ]);
});

module.exports = router