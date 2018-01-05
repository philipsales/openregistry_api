'use strict';

var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');

var {authenticate} = require('../server/middleware/authenticate');
var {Permission} = require('../server/models/permission');

router.use(bodyParser.json());

router.get('/', authenticate, (req, res) => {
    Permission.find().then((permissions) => {
        var data = permissions.map((permission) => permission.toJSON());
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

module.exports = router