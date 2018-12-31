'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Spec, SpecError} = require('../server/models/spec');

var {authenticate} = require('../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/', authenticate, (req, res) => {
    Spec.find({is_deleted: false}).sort({name: 1}).then((Specs) => {
        var data = Specs.map((this_spec) => {
            // do something here if you need to remove some fields
            return this_spec;
        });
        res.send({data});
    }).catch((error) => {
        if (error instanceof SpecError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });

});

router.get('/:id', authenticate, (req, res) => {

    // console.log(req.params.id); 
    Spec.findOne({
        _id: req.params.id
    }).then((this_spec) => {
        if(this_spec){
            res.status(200).send(this_spec);
        } else {
            return res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof SpecError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });

});


router.post('/', authenticate, (req, res) => {

    var body = _.pick(req.body,['id', 'name']);
    // console.log('req:', req.body);
    body = _.assign(body);
    var NewSpec = new Spec(body);
    NewSpec.save().then((saved_Spec) => {
        return res.status(201).send(saved_Spec);
    }).catch((error) => {
        if (error instanceof SpecError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });

});

router.patch('/:id', authenticate, (req, res) => {

    var id = req.params.id;
    var body = _.pick(req.body,['name', 'is_deleted']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    // console.log(body);
    // console.log(id);

    Spec.findByIdAndUpdate({
        _id: id
    }, {
        $set: body
    }, {
        new: true
    }).then((Spec) => {
        if (Spec) {
            res.status(200).send(Spec);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof SpecError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });

});

module.exports = router