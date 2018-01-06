'use strict';

var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');

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

module.exports = router