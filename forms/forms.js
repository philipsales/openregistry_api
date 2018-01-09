'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Form, FormError} = require('../server/models/form');

router.use(bodyParser.json());

router.post('/', authenticate, (req, res) => {
    var seed = _.pick(req.body, ['name', 'organization', 'department', 'type', 'approval', 'status', 'created_by', 'date_created', 'is_deleted', 'sections']);
    var instance = new Form(seed);

    Form.findOneAndRemove({name : seed.name}).then(() => {
        instance.save().then((saved_form) => {
            return res.status(201).send(saved_form);
        }, (error) => {
            console.log('error on save!');
            return Promise.reject(error);
        })
    }).catch((error) => {
        console.log('error on upper!');
        if (error instanceof FormError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

module.exports = router