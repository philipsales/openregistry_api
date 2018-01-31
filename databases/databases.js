'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const Mongo = require('./dbBackup');
var {Database, DatabaseError} = require('../server/models/database');

var {authenticate} = require('../server/middleware/authenticate');
router.use(bodyParser.json());

router.get('/', (req, res) => {
    
    Database.find({isDeleted: false})
            .then((databases) => {
                var data = databases.map((database) => {
                return database;
            });
        res.send({data});
    })
    .catch((error) => {
        if (error instanceof DatabaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.get('/:id', (req, res) => {
    console.log(req.params.id); 

    Database.findOne({
        _id: req.params.id
    }).then((database) => {
        res.status(200).send(database);
    }).catch((error) => {
        if (error instanceof DatabaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});


router.post('/backup', (req, res) => {

    var body = _.pick(req.body, ['name', 'createdBy','description', 'dirPath']);

    Mongo.dbDump().then((result) => {
        var path = { dirPath: String(result) }
        body = _.assign(body,path)

        var database = new Database(body);

        database.save().then((saved_database) => {
            return res.status(201).send(saved_database);
        }).catch((error) => {
            if (error instanceof DatabaseError) {
                return res.status(400).send(JSON.parse(error.message));
            } else {
                console.log(error);
                return res.status(500).send(error);
            }
        });
    });
});

router.patch('/backup/:id',  (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['name', 'dirPath', 'createdBy','description']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    console.log(body);
    console.log(id);

    Database.findByIdAndUpdate({
        _id: id
    }, {
        $set: body,
        $inc: {__v: 1}
    }, {
        new: true
    }).then((database) => {
        if (database) {
            res.status(200).send(database);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof DatabaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.post('/restore/:id', (req, res) => {
    console.log(req.params.id);

    Database.findOne({
        _id: req.params.id
    }).then((database) => {
        res.status(200).send(database);
        Mongo.dbRestore(database.dirPath).then(() => { });
    }).catch((error) => {
        if (error instanceof DatabaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
    

});
module.exports = router