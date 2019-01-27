'use strict'

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Department} = require('../server/models/department');

router.use(bodyParser.json());

router.get('/isDepartmentNameValid/:id?/:name?/', (req, res) => {
    let id = req.query.id;
    let name = req.query.name;
    if (!ObjectID.isValid(id)) {
        Department.findOne({name}).then(department => {
            res.send(isValidDeptartmentName(department));
        });
    } else {
        // set true if department is being updated with same name
        Department.findOne({_id: id, name: name}).then(department => {

            if (department) {
                return res.send(true);
            } else {
                Department.findOne({name}).then(department => {
                    return res.send(department == null);
                });
            }
        });
    }
});

function isValidDeptartmentName(result) {
    return result == null;
}

router.get('/find/:id?/', (req, res) => {
    let id = req.query.id;
    if (!ObjectID.isValid(id)) {
        return res.send({});
    } //
    Department.findOne({_id:id}).then(department => {
        if (department != null) {
            return res.send(department);
        }
        return res.send({});
    });
});

router.patch('/:id?', (req, res) => {
    let _id = req.query.id;
    if (!ObjectID.isValid(_id)) {
        return res.status(422).send(new Error('Invalid ID!'));
    }
    Department.findOneAndUpdate({_id}, req.body, {new: true}, 
    (error, doc) => {
        if (error) {
            return res.status(400).send(error);
        }
        console.log(doc, 'new doc?');
        return res.status(200).send(doc);
    });
});

router.get('/all', (req, res) => {
    Department.find().then(departments => {
        return res.status(200).send(departments);
    }, e => { 
        return res.status(400).send(e);
    });
});

router.get('/:index?/:limit?/:keywords?/:sort?', authenticate, (req, res) => {
    if (!req.query.index) { // for legacy support
        return Department.find().then(departments => {
            res.status(200).send(departments);
        }, error => res.status(400).send(error));
    }
    // pagination!
    let index = req.query['index'] || 0;
    let limit = parseInt(req.query['limit'] || 10);
    let keywords = req.query['keywords'] || '';
    let sort = parseInt(req.query['sort'] || 1);
    Promise.all([
        Department.count({name: new RegExp(keywords, 'i')}),
        getDepartments(index, limit, keywords, sort)
    ]).then(result => {
        const [count, departments] = result;
        return res.status(200).send({count, departments});
    }).catch(error => {
        console.error(error, 'error');
        return res.status(400).send(error);
    });
});

function getDepartments(index = 0, limit = 10, keywords='', sort=1) {
    if (index < 0) {
        index -= 1;
    }
    let skip = index * limit;
    return Department.find(
        {name: new RegExp(keywords, 'i')}, 
        null, 
        {skip, limit})
        .sort({name: sort});
}

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, 
        ['name', 'description', 'code', 'organization']);
    var department = new Department(body);
    department.save().then(new_department => 
        res.status(200).send(new_department),
        error => res.status(400).send(error)
    );
});

module.exports = router