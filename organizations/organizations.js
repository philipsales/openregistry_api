'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Organization, OrganizationError} = require('../server/models/organization');

router.use(bodyParser.json());

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['name']);
    var organization = new Organization(body);
    organization.save().then((saved_org) => {
        //console.log(saved_org);
        return res.status(201).send(saved_org);
    }).catch((error) => {
        if (error instanceof OrganizationError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});


router.get('/', (req, res) => {
    Organization.find({isDeleted: false}).then((orgs) => {
        var data = orgs.map((org) => org);
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    Organization.findOne({
        _id: id,
        isDeleted: false
    }).then((org) => {
        if (org){
            res.send(org);
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['name']);
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Organization.findOneAndUpdate({
        _id: id
    }, {
        $set: body
    }, {
        new: true
    }).then((org) => {
        if (org) {
            res.send(org);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof OrganizationError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    Organization.findOneAndUpdate({
        _id: id,
        isDeleted: false
    }, {
        $set: {
            isDeleted: true       
        }
    }, {
        new: true
    }).then((org) => {
        if (org) {
            res.send(org);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(400).send();
    });
});

module.exports = router