'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const fs = require('fs');

var {authenticate} = require('../server/middleware/authenticate');
var {Case, CaseError} = require('../server/models/case');

const formidable = require('formidable');
const path = require('path');

var upload_file = process.env.UPLOAD_DIR + "consent_templates/";

router.use(bodyParser.json());

router.post('/', authenticate, (req, res) => {
    var seed = _.pick(req.body, [
        'case_number', 
        'organization', 
        'diagnosis', 
        'created_by',
        'specforms',
        'forms']);
    var instance = new Case(seed);
    
    Case.findOne({
        case_number: instance['case_number'], 
        is_deleted: false
    }, (err, obj) => {
        if (obj == null) {
            instance.save().then(
                saved_case => res.status(201).send(saved_case), 
                
                error => res.status(400).send('Error oncreating form'));
        } else {
            return res.status(409).send('Case number already exist');
        }
    });
});


router.get('/', authenticate, (req, res) => {
    Case.find({is_deleted: false})
    .sort({ case_number: 'asc' })
    // .sort({ case_number: 'asc' })
    .then((cases) => {
        var data = cases.map((value) => {
            var out = value.toJSON();
            for(let form of out.forms){
                delete form['answers'];
            }
            // delete out['specforms'];
            return out;
        });
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/list/:index?/:limit?/:keywords?/:sort?', (req, res) => {
    let limit = parseInt(req.query['limit'] || 10);
    let keywords = req.query['keywords'] || '';
    let sort = req.query['sort'] || 0;
    let index = req.query['index'] || 0;

    Promise.all([
        Case.count({case_number: new RegExp(keywords, 'i'), is_deleted: false}),
        getCases(index, limit, keywords, sort)
    ]).then(result => {
        const [count, cases] = result;
        return res.status(200).send({count, cases});
    }).catch(error => {
        console.error(error, 'error');
        return res.send(400).send(error);
    });
});

function getCases(index = 0, limit = 10, keywords='', sort=0) {
    if (index < 0) {
        index -= 1;
    }
    let skip = index * limit;
    let condition = {
        case_number: new RegExp(keywords, 'i'),
         is_deleted: false
    };

    let args = {date_created: -1};
    if (sort != 0) {
        args = {case_number: sort};
    }
    
    return Case.find(condition, null, {skip, limit})
    .sort(args);
}

router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    Case.findOne({
        _id: id,
        is_deleted: false 
    })
    .then((data) => {
        if (data){
            data.forms.sort((a, b) => a.date_created < b.date_created);
            res.send(data);
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    Case.findOneAndUpdate({
        _id: id,
        is_deleted: false
    }, {
        $set: {
            is_deleted: true       
        }
    }, {
        new: true
    }).then((data) => {
        if (data) {
            res.send(data);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, [
        'case_number', 
        'status', 
        'is_deleted', 
        'is_active', 
        'date_created', 
        'diagnosis', 
        'specforms',
        'forms']);

    Case.findOneAndUpdate({
        _id: id,
        is_deleted: false
    }, {
        $set: body
    }, {
        new: true
    }).then((updated_case) => {
        if (updated_case) {
            res.send(updated_case);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof CaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.post('/:id/forms', authenticate, (req, res) => {
    var seed = _.pick(req.body, [
        'form_name', 
        'form_id', 
        'created_by', 
        'answers'
    ]);
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('invalid object');
        res.status(400).send();
        return;
    }
    Case.findOne({
        '_id': id,
        'is_deleted': false
    }).then((instance) => {
        if (instance){
            const new_form = {
                form_name: seed.form_name,
                form_id: seed.form_id
            };
            if ('answers' in seed) {
                new_form.answers = seed.answers;
            }

            let total = instance.forms.push(new_form);
            instance.save().then((saved_case) => {
                return res.status(201).send(saved_case.forms[total - 1]);
                //return res.status(201).send(saved_case);
            }, (error) => {
                return Promise.reject(error);
            })
        } else {
            console.log('instance null');
            return res.status(400).send();
        }
    }).catch((e) => {
        console.log(e);
        console.log('can not find case : ' + id);
        res.status(400).send();
    });
});

router.get('/:id/forms/:formid', authenticate, (req, res) => {
    var formid = req.params.formid;
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    Case.findOne({
        '_id': id,
        'is_deleted': false
    }).then((data) => {
        if (data){
            let forms = data.forms.id(formid);
            if(forms) {
                res.send(forms);
            } else {
                res.status(404).send();
            }
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

//router.patch('/:id/forms/:formid', authenticate, (req, res) => {
router.patch('/:id/forms/:formid', (req, res) => {
    console.log('CASES- PATCH---');
    //console.log('CASES- PATCH- REQ BODY--',req.body);
    var seed = _.pick(req.body, ['answers']);
    var formid = req.params.formid;
    //console.log('CASES- PATCH- REQ PARAMS--',req.params);
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        console.log('invalid object');
        res.status(400).send();
        return;
    }
    Case.findOne({
        '_id': id,
        'is_deleted': false
    }).then((instance) => {
        //console.log('CASES- PATCH- INSTANCE--',instance);
        if (instance){
            let forms = instance.forms.id(formid);
            if (forms) {
                //console.log('CASES- PATCH- FORMSl--',forms);
                //console.log('CASES- PATCH- SEED.ANSWERS--',seed.answers);
                forms.answers = seed.answers;
                instance.save().then((saved_case) => {
                    return res.status(200).send(saved_case.forms.id(formid));
                    //return res.status(201).send(saved_case);
                }, (error) => {
                    return Promise.reject(error);
                });
            } else {
                console.log('form not found');
                return res.status(404).send();    
            }
        } else {
            console.log('instance null');
            return res.status(404).send();
        }
    }).catch((e) => {
        console.log(e);
        console.log('can not find case : ' + id);
        res.status(404).send();
    });
});


router.patch('/:id/specforms', authenticate, (req, res) => {
    var seed = _.pick(req.body, ['specforms']);
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        console.log('invalid object');
        res.status(400).send();
        return;
    }

    Case.findOneAndUpdate({
        _id: id,
        is_deleted: false
    }, {
        $set: seed
    }, {
        new: true
    }).then((updated_case) => {
        if (updated_case) {
            res.send(updated_case);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof CaseError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();

    form.multiples = false;
    form.uploadDir = path.resolve(__dirname, upload_file);

    //parse the request to form data
    form.parse(req, function(err, fields, files) {

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
        else {
            res.status(200).json(data);
        }
    });

    //modify file path
    form.on('fileBegin', function(name, file){
        file.path = form.uploadDir + "/" + file.name;
    });

    //close end
    form.on ('end', function(){
        res.end();
        console.log('END====');
    }); 
});

router.get('/download/:path', (req, res) => {
    var dump_file = "./../uploads/consent_templates/" + req.params.path;

    res.sendFile(path.resolve(__dirname, dump_file), function(err){
        if (err) {
          console.log(err);
          res.status(400).end();
        } else {
          res.status(200).end();
        }
    }); 
});

module.exports = router