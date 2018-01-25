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

    Case.findOneAndRemove({case_number : seed.case_number}).then(() => {
        instance.save().then((saved_case) => {
            return res.status(201).send(saved_case);
        }, (error) => {
            return Promise.reject(error);
        })
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
    Case.find({isDeleted: false}).then((cases) => {
        var data = cases.map((value) => {
            var out = value.toJSON();
            for(let form of out.forms){
                delete form['answers'];
            }
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
    Case.findOne({
        _id: id,
        isDeleted: false
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

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    Case.findOneAndUpdate({
        _id: id,
        isDeleted: false
    }, {
        $set: {
            isDeleted: true       
        }
    }, {
        new: true
    }).then((data) => {
        if (data) {
            res.send(data);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(400).send();
    });
});

module.exports = router