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

var upload_file = process.env.UPLOAD_DIR + "consent_templates/";

router.use(bodyParser.json());

//create forms WITH upload file
//router.post('/', authenticate, (req, res) => {
router.post('/', authenticate, (req, res) => {
    var body;
    var form = new formidable.IncomingForm();

    form.multiples = false;
    form.uploadDir = path.resolve(__dirname, upload_file);

    //parse the request to form data
    form.parse(req, function(err, field, files) {
        body = _.pick(JSON.parse(field.data), [
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
        file.path = form.uploadDir + "/" + (file.name).split(' ').join('_');;
    });
    //after success parsing
    form.on ('end', function(){

        var instance = new Form(body);

        Form.findOneAndRemove({name : body.name, is_deleted: false}).then(() => {
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

    Form.findOneAndRemove({name : seed.name, is_deleted: false}).then(() => {
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
    Form.find({is_deleted: false})
        .sort({ date_created: 'desc' })
        .then((forms) => {
            var data = forms.map((form) => {
                var out = form.toJSON();
                delete out.sections;
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
    Form.findOne({
        _id: id,
        is_deleted: false
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


router.patch('/v0/:id', authenticate, (req, res) => {
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
        _id: id,
        is_deleted: false
    }, {
        $set: body
    }, {
        new: true
    }).then((data) => {
        if (data) {
            res.status(200).send(data);
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

router.patch('/:id', authenticate, (req, res) => {
    var body;
    var id = req.params.id;

    var form = new formidable.IncomingForm();
    form.multiples = false;
    form.uploadDir = path.resolve(__dirname, upload_file);

    //parse the request to form data
    form.parse(req, function(err, field, files) {

        body = _.pick(JSON.parse(field.data), [
            'name', 
            'organization', 
            'department', 
            'dir_path', 
            'validity_date', 
            'type', 
            'approval', 
            'status', 
            'sections']);

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
        file.path = form.uploadDir + "/" + (file.name).split(' ').join('_');;
    });

    //after success parsing
    form.on ('end', function(){

        if(!ObjectID.isValid(id)) {
            return res.status(404).send();
        }

        Form.findOneAndUpdate({
            _id: id,
            is_deleted: false
        }, {
            $set: body
        }, {
            new: true
        }).then((data) => {
            if (data) {
                res.status(200).send(data);
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
    
   
});



router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    Form.findOneAndUpdate({
        _id: id,
        is_deleted: false
    }, {
        $set: {
            is_deleted: true       
        }
    }, {
        new: true
    }).then((form) => {
        if (form) {
            res.send(form);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(400).send();
    });
});

module.exports = router