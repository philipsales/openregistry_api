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
    var seed = _.pick(req.body, [
        'name', 
        'organization', 
        'department', 
        'type', 
        'approval', 
        'status', 
        'created_by', 
        'date_created', 
        'isActive', 
        'is_deleted', 
        'sections']);
    var instance = new Form(seed);

    Form.findOneAndRemove({name : seed.name}).then(() => {
        instance.save().then((saved_form) => {
            return res.status(201).send(saved_form);
        }, (error) => {
            console.log(error);
            return Promise.reject(error);
        })
    }).catch((error) => {
        if (error instanceof FormError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });});


router.get('/', authenticate, (req, res) => {
    Form.find({is_deleted: false}).then((forms) => {
        var data = forms.map((form) => {
            var out = form.toJSON();
            delete out.sections;
            return out;
        });
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});


router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    Form.findOne({
        _id: id
    }).then((data) => {
        if (data){
            res.send(data);
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router