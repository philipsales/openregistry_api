'use strict'

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Department} = require('../server/models/department');

router.use(bodyParser.json());

router.get('/:index?/:limit?/:keywords?/', (req, res) => {
    let index = req.query['index'] || 0;
    let limit = parseInt(req.query['limit'] || 10);
    let keywords = req.query['keywords'] || '';
    Promise.all([
        Department.count({name: new RegExp(keywords, 'i')}),
        getDepartments(index, limit, keywords, res)
    ]).then(result => {
        const [count, departments] = result;
        return res.status(200).send({count, departments});
    }).catch(error => {
        console.error(error, 'error');
        return res.status(400).send(error);
    });
});

function getDepartments(index = 0, limit = 10, keywords='', res) {
    if (index < 0) {
        index -= 1;
    }
    let skip = index * limit;
    return Department.find({name: new RegExp(keywords, 'i')}, null, {skip, limit});
}

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['name', 'description']);
    var department = new Department(body);
    department.save().then(new_department => 
        res.status(200).send(new_department),
        error => res.status(400).send(error)
    );
});

module.exports = router