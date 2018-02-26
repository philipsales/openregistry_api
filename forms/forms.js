'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();

const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {authenticate} = require('../server/middleware/authenticate');
var {Form, FormError} = require('../server/models/form');

const formidable = require('formidable');
const path = require('path');
var upload_file = "./../uploads/consent_templates/"  ;

router.use(bodyParser.json());

var upload_file = "./../uploads/consent_templates/"  ;

//create forms WITH upload file
//router.post('/', authenticate, (req, res) => {
router.post('/', (req, res) => {
    console.log('PATH:',req.form);
    var form = new formidable.IncomingForm();

    form.multiples = false;
    form.uploadDir = path.resolve(__dirname, upload_file);
    var seed;

    //parse the request to form data
    form.parse(req, function(err, fields, files) {

        console.log('form.files', files);
        console.log('form.fields', fields.data);

        seed = _.pick(JSON.parse(fields.data), [
            'name', 
            'organization', 
            'department', 
            'type', 
            'approval', 
            'validity_date', 
            'status', 
            'dir_path',
            'created_by', 
            'date_created', 
            'isActive', 
            'is_deleted', 
            'sections']);

        console.log('SEED: ', seed);

            var data = {
                status: 'Success',
                result: { 
                    'payload' : []
                },
                error: err
            };
            
            if(err) {
                res.status(400).json(data);
                throw err;
            }
    });

    //modify file path
    form.on('fileBegin', function(name, file){
        console.log('REQ.FILE', file);
        file.path = form.uploadDir + "/" + file.name;
    });
    //after success parsing
    form.on ('end', function(){

        var instance = new Form(seed);

        Form.findOneAndRemove({name : seed.name}).then(() => {
            instance.save().then((saved_form) => {
                return res.status(201).send(saved_form);
            }, (error) => {
                console.log(error);
                return Promise.reject(error);
            })
        }).catch((error) => {
            if (error instanceof FormError) {
                return res.status(400).send(JSON.parse(error.message));
            } else {
                console.log(error);
                return res.status(500).send(error);
            }
        });

        //res.end();
        console.log('END====');
    }); 

});

//create forms without upload file
//router.post('/', authenticate, (req, res) => {
router.post('/v0', authenticate, (req, res) => {
    var seed = _.pick(req.body, [
        'name', 
        'organization', 
        'department', 
        'type', 
        'approval', 
        'validity_date', 
        'status', 
        'created_by', 
        'date_created', 
        'isActive', 
        'is_deleted', 
        'sections']);
    var instance = new Form(seed);
    console.log('POST FORM',seed);

    Form.findOneAndRemove({name : seed.name}).then(() => {
        instance.save().then((saved_form) => {
            return res.status(201).send(saved_form);
        }, (error) => {
            console.log(error);
            return Promise.reject(error);
        })
    }).catch((error) => {
        if (error instanceof FormError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});


router.get('/', authenticate, (req, res) => {
    console.log('GET LIST OF FORMS');
    Form.find({is_deleted: false}).then((forms) => {
        var data = forms.map((form) => {
            var out = form.toJSON();
            delete out.sections;
            return out;
        });
        console.log('LIST: ',data);
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
    Form.findOne({
        _id: id
    }).then((data) => {
        if (data){
            res.send(data);
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});


router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, [
        'name', 
        'organization', 
        'department', 
        'validity_date', 
        'type', 
        'approval', 
        'status', 
        'sections']);
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    console.log('PATCH FORM', body);

    Form.findOneAndUpdate({
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





module.exports = router