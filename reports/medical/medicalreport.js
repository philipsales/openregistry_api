'use strict';

const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {app} = require('../../server/server');

const Reports = require('./dbAggregate');
const {setReportRaw, setReportCount} = require('./dbAggregate');
var {MedicalReport, MedicalReportError} = require('../../server/models/medicalreport');
var {MedicalReportCount, MedicalReportCountError} = require('../../server/models/medicalreportcount');

var {authenticate} = require('../../server/middleware/authenticate');

router.use(bodyParser.json());

router.get('/medicalreports', (req, res) => {

    setReportRaw().then(() => {
        MedicalReport.find()
        .then((reports) => {
            var data = reports.map((report) => {
                console.log('---/medicalreports-----');
                return report;
            });

            var result = {
                length: data.length,
                payload: data
            };

            res.status(200).send({result});
        }).catch((error) => {
            if (error instanceof MedicalReportError) {
                return res.status(400).send(JSON.parse(error.message));
            } else {
                return res.status(500).send(error);
            }
        });
    });
});

router.post('/medicalreportcounts', (req, res) => {
    //var body = _.pick(req.body, ['form']);
    var body = _.pick(req.body, ['form_name']);
    console.log('---body---', body);


    setReportCount(body).then(() => {
        console.log('----setReportCouht---');
        MedicalReportCount.find()
        .then((reports) => {
            var data = reports.map((report) => {
                console.log('---/medicalreportcounts----');
                return report;
            });

            var result = {
                length: data.length,
                payload: data
            };

            res.status(200).send({result});
        }).catch((error) => {
            if (error instanceof MedicalReportError) {
                return res.status(400).send(JSON.parse(error.message));
            } else {
                return res.status(500).send(error);
            }
        });
    });
});

module.exports = router