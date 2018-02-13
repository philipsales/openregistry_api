'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {IcdOncology, IcdOncologyError} = require('../../server/models/icd/icdoncology');

var {authenticate} = require('../../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/icdoncologies', (req, res) => {
    let specific_fields = { diagnosis_code: 1, diagnosis_name: 1, _id:0 };
    let query = parseQuery(req.query);

    IcdOncology.find(query, specific_fields)
        .limit()
        .skip(0)
        .then((diagnosis) => {
            console.log(diagnosis.length);
            if (diagnosis.length > 400) {
                var error = {
                    "message": "Results returned more than 400 rows, please refine your search"
                }; 

                var result = {
                    length: diagnosis.length,
                    error: error,
                    payload: []
                };

                res.send({result});
            }
            else if (diagnosis.length == 0) {
                var error = {
                    "message": "No result found"
                }; 

                var result = {
                    length: diagnosis.length,
                    error: error,
                    payload: []
                };

                res.send({result});
            }
            else {
                var length = diagnosis.length;
                var data = diagnosis.map((resource) => {
                return resource;
                });

                var result = {
                    length: diagnosis.length,
                    error: error,
                    payload: data 
                };

                res.status(200).send({result});
            }
    }).catch((error) => {
        if (error instanceof IcdOncologyError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            return res.status(500).send(error);
        }
    });


});

const parseQuery = (query) => {
    let site = query.site;
    let histology = query.histology;
    
    let params_site = {site_name: { '$regex' : site, '$options':'"i' }} ;
    let params_histology = {histology_name: { '$regex' : histology, '$options':'"i' }} ;
    let both = { $and: [ params_site, params_histology ] };
    let final_query = ''; 

    if(histology && !site){
        final_query =  params_histology;
        console.log('histology only');
    }
    else if(!histology && site) {
        let params_site = 
                {site_name: { '$regex' : site, '$options':'"i' }} ;
        final_query =  params_site;
        console.log('site only');
    }
    else {
        final_query =  both;
    }
    return final_query;
}




module.exports = router