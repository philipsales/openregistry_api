'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {Resource, ResourceError} = require('../../server/models/fhir/resource');

var {authenticate} = require('../../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/fhirresources', (req, res) => {
    console.log(req.param);
    Resource.find()
           .then((resources) => {
        console.log(resources);
                var data = resources.map((resource) => {
                return resource;
            });
        res.send({data});
    }).catch((error) => {
        if (error instanceof ResourceError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });
});

module.exports = router