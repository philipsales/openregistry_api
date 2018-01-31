'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {Consent, ConsentError} = require('../server/models/consent');

var {authenticate} = require('../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/', (req, res) => {
    Consent.find({is_deleted: false})
           .then((consents) => {
                var data = consents.map((consent) => {
                return consent;
            });
        res.send({data});
    }).catch((error) => {
        if (error instanceof ConsentError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });
});

router.get('/:id', (req, res) => {
    console.log(req.params.id); 

    Consent.findOne({
        _id: req.params.id
    }).then((consent) => {
        res.status(200).send(consent);
    }).catch((error) => {
        if (error instanceof ConsentError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});


router.post('/', (req, res) => {

    var body = _.pick(req.body,['id', 
                                'name', 
                                'created_by',
                                'date_created',
                                'number',
                                'description', 
                                'organization', 
                                'dir_path',
                                'validity_date',
                                'forms']);

    console.log('req:', req.body);

    body = _.assign(body);

    var consent = new Consent(body);

    consent.save()
           .then((saved_consent) => {
                return res.status(201).send(saved_consent);
    }).catch((error) => {
        if (error instanceof ConsentError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.patch('/:id',  (req, res) => {
    var id = req.params.id;

    var body = _.pick(req.body,['name', 
                                'created_by',
                                'number',
                                'description', 
                                'dir_path',
                                'validity_date',
                                'forms']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    console.log(body);
    console.log(id);

    Consent.findByIdAndUpdate({
        _id: id
    }, {
        $set: body
    }, {
        new: true
    }).then((consent) => {
        if (consent) {
            res.status(200).send(consent);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof ConsentError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.post('/restore/:id', (req, res) => {
    console.log(req.params.id);

    Consent.findOne({
        _id: req.params.id
    }).then((consent) => {
        res.status(200).send(consent);
        Mongo.dbRestore(consent.dirPath).then(() => { });
    }).catch((error) => {
        if (error instanceof ConsentError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });

});
module.exports = router