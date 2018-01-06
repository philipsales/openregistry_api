'use strict';

var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Role} = require('../server/models/role');

router.use(bodyParser.json());

router.get('/', authenticate, (req, res) => {
    Role.find().then((roles) => {
        var data = roles.map((role) => {
            var out = role.toJSON();
            delete out.permissions;
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
    Role.findOne({
        _id: id
    }).then((role) => {
        if (role){
            res.send(role);
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router