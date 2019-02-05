'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {MTA, MTAError} = require('../server/models/mta');
var {authenticate} = require('../server/middleware/authenticate');

const formidable = require('formidable');
const path = require('path');

var upload_file = process.env.UPLOAD_DIR + "mtas/";

router.use(bodyParser.json());

router.get('/', (req, res) => {
    MTA.find({is_deleted: false})
           .then((mtas) => {
            var data = mtas.map((mta) => {
                return mta;
            });
        res.send({data});
    }).catch((error) => {
        if (error instanceof MTAError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });
});

router.get('/find/:id?', (req, res) => {
    let id = req.query.id;
    if (!ObjectID.isValid(id)) {
        return res.send({});
    }
    MTA.findOne({_id: id, is_deleted: false}).then(mta => {
        if (mta != null) {
            return res.send(mta);
        }
        return res.send({});
    });
});

router.delete('/:id?', (req, res) => {
    let id = req.query.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    MTA.findOneAndUpdate({_id: id, is_deleted: false}, {
        $set: { is_deleted: true }
    }, {new:true}).then(mta => {
        if (mta) {
            return res.send(mta);
        }
        return res.status(404).send();
    }).catch(error => {
        return res.status(404).send(error);
    });
});

router.post('/', authenticate, (req, res) => {
    var body;
    var form = new formidable.IncomingForm();

    form.multiples = false;
    form.uploadDir = path.resolve(__dirname, upload_file);

    form.parse(req, function (err, field, files) {
        body = _.pick(
            JSON.parse(field.data), 
            ['_id', 'name', 'type', 'description', 'dir_path', 'is_deleted']
        );
        if (err) {
            console.error(err, 'micool');
            res.status(400).send(err);
        }
    });

    form.on('fileBegin', function(name, file) {
        file.path = form.uploadDir + "/" + (file.name).split(' ').join('_');
        console.log(file.path, 'micool path');
    });

    form.on('end', function() {
        var _id = body['_id'];
        var is_deleted = body['is_deleted'];
        if (ObjectID.isValid(_id)) {
            MTA.findOneAndUpdate({_id, is_deleted}, 
                {$set:body}, {new: true}).then(updated_mta => {
                if (updated_mta) {
                    return res.status(200).send(updated_mta);
                }
                return res.status(404).send();
            }, error => res.status(404).send(error));
        } else {
            var mta = new MTA(body);
            mta.save().then((saved_mta) => {
                return res.status(201).send(saved_mta);
            }).catch((error) => {
                if (error instanceof MTAError) {
                    return res.status(400).send(JSON.parse(error.message));
                } else {
                    console.log(error);
                    return res.status(500).send(error);
                }
            });
        }
    });

});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    MTA.findOneAndUpdate({
        _id: id,
        is_deleted: false
    }, {
        $set: {
            is_deleted: true       
        }
    }, {
        new: true
    }).then((mta) => {
        if (mta) {
            res.send(mta);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(400).send();
    });
});

router.get('/download/:id?', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    console.log(id);
    MTA.findOne({
        _id: id,
        is_deleted: false
    }).then((data) => {
        console.log(data);
        if (data){
            var dump_file = "./../uploads/mtas/" + data.dir_path;
            console.log(dump_file);
            res.sendFile(path.resolve(__dirname, dump_file), function(err){
                if (err) {
                  console.log(err);
                  return res.status(400).end();
                } else {
                  return res.status(200).end();
                }
            });
        } else {
            return res.status(404).send();
        }
    }).catch((e) => {
        return res.status(400).send();
    });
});

module.exports = router