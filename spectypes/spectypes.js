'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {SpecType, SpecTypeError} = require('../server/models/spectype');

var {authenticate} = require('../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/', authenticate, (req, res) => {

    SpecType.find({is_deleted: false}).sort({name: 1}).then((SpecTypes) => {
        var data = SpecTypes.map((this_SpecType) => {
            // do something here if you need to remove some fields
            return this_SpecType;
        });
        res.send({data});
    }).catch((error) => {
        if (error instanceof SpecTypeError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });

});

router.get('/:id', authenticate, (req, res) => {

    // console.log(req.params.id); 
    SpecType.findOne({
        _id: req.params.id
    }).then((this_SpecType) => {
        if(this_SpecType){
            res.status(200).send(this_SpecType);
        } else {
            return res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof SpecTypeError) {
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
    var NewSpecType = new SpecType(body);
    NewSpecType.save().then((saved_SpecType) => {
        return res.status(201).send(saved_SpecType);
    }).catch((error) => {
        if (error instanceof SpecTypeError) {
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

    SpecType.findByIdAndUpdate({
        _id: id
    }, {
        $set: body
    }, {
        new: true
    }).then((SpecType) => {
        if (SpecType) {
            res.status(200).send(SpecType);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof SpecTypeError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });

});

module.exports = router