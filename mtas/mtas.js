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

router.post('/', (req, res) => {
    var body;
    var new_filename = '';
    var form = new formidable.IncomingForm();

    form.multiples = false;
    form.uploadDir = path.resolve(__dirname, upload_file);

    //modify file path
    form.on('fileBegin', function(name, file){
        new_filename = (file.name).split(' ').join('_');
        file.path = form.uploadDir + "/" + new_filename;
    });
    
    //parse the request to form data
    form.parse(req, function(err, field, files) {
        body = _.pick(field, ['name']);
        var data = {
            status: 'Failed',
            result: { 
                'payload' : []
            },
            error: err
        }

        if(body){
            body['is_deleted'] = false;
            body['dir_path'] = new_filename;
            console.log(body);
    
            data = {
                status: 'Success',
                result: { 
                    'payload' : []
                },
                error: err
            };
        } else {
            res.status(400).json(data);
            throw 'No content submitted';
        }
        
        
        if(err) {
            res.status(400).json(data);
            throw err;
        }
    }); //-- save mta

    //after success parsing
    form.on ('end', function(){
        console.log('xxxx');
        console.log(body);
        body = _.assign(body);

        var mta = new MTA(body);
        mta.save()
            .then((saved_mta) => {
                    return res.status(201).send(saved_mta);
        }).catch((error) => {
            if (error instanceof MTAError) {
                return res.status(400).send(JSON.parse(error.message));
            } else {
                console.log(error);
                return res.status(500).send(error);
            }
        });

        //res.end();
    }); 

});


router.delete('/:id', (req, res) => {
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

router.get('/:id/download', (req, res) => {
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