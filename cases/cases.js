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
    var seed = _.pick(req.body, ['case_number', 'diagnosis', 'forms']);
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
    Case.find({is_deleted: false}).then((cases) => {
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
        is_deleted: false
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
        is_deleted: false
    }, {
        $set: {
            is_deleted: true       
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

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['case_number', 'diagnosis', 'date_created', 'forms']);

    Case.findOneAndUpdate({
        _id: id,
        is_deleted: false
    }, {
        $set: body
    }, {
        new: true
    }).then((updated_case) => {
        if (updated_case) {
            res.send(updated_case);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof CaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.post('/:id/forms', authenticate, (req, res) => {
    var seed = _.pick(req.body, ['form_name', 'form_id', 'answers']);
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('invalid object');
        res.status(400).send();
        return;
    }
    Case.findOne({
        '_id': id,
        'is_deleted': false
    }).then((instance) => {
        if (instance){
            const new_form = {
                form_name: seed.form_name,
                form_id: seed.form_id
            };
            if ('answers' in seed) {
                new_form.answers = seed.answers;
            }

            let total = instance.forms.push(new_form);
            instance.save().then((saved_case) => {
                return res.status(201).send(saved_case.forms[total - 1]);
                //return res.status(201).send(saved_case);
            }, (error) => {
                return Promise.reject(error);
            })
        } else {
            console.log('instance null');
            return res.status(400).send();
        }
    }).catch((e) => {
        console.log(e);
        console.log('can not find case : ' + id);
        res.status(400).send();
    });
});

router.get('/:id/forms/:formid', authenticate, (req, res) => {
    var formid = req.params.formid;
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    Case.findOne({
        '_id': id,
        'is_deleted': false
    }).then((data) => {
        if (data){
            let forms = data.forms.id(formid);
            if(forms) {
                res.send(forms);
            } else {
                res.status(404).send();
            }
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router