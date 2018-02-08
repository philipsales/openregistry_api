'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {IcdOncology, IcdOncologyError} = require('../../server/models/icd/icdoncology');

var {authenticate} = require('../../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/icdoncologies', (req, res) => {
    console.log(req.param);
    IcdOncology.find()
           .then((resources) => {
        console.log(resources);
                var data = resources.map((resource) => {
                return resource;
            });
        res.send({data});
    }).catch((error) => {
        if (error instanceof IcdOncologyError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });
});

module.exports = router