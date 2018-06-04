'use strict';

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;

var {Case, CaseError} = require('../../server/models/case');
var {Form, FormError} = require('../../server/models/form');

const options   = require('./aggregates/medical.options');
const questions = require('./aggregates/medical.questions');
const reportMedical = require('./aggregates/medical.final');

var setFormsOptions = () => {

    return new Promise((resolve, reject) => {
        Form.aggregate(options,
            function (err, result) {
                if (err instanceof FormError) {
                    console.log(err);
                    reject();
                    return err;
                } 
                else {
                    resolve(result);
                }
            }
        );
    })
    .catch((error)=>{
        console.log('--setFOrmsOptions Error encountered');
        reject(error);
    });
};

var setFormsQuestions = () => {

    return new Promise((resolve, reject) => {
        Form.aggregate(questions,
            function (err, result) {
                if (err instanceof FormError) {
                    console.log(err);
                    reject();
                    return err;
                } 
                else {
                    resolve(result);
                }
            }
        );
    })
    .catch((error)=>{
        console.log('--setFOrmsQuestions Error encountered');
        reject(error);
    });
};

var getReportsMedical = () => {

    return new Promise((resolve, reject) => {
        Case.aggregate(reportMedical,
            function (err, result) {
                if (err instanceof CaseError) {
                    console.log(err);
                    reject(err);
                    return err;
                } 
                else {
                    resolve(result);
                }
            }
        );
    })
    .catch((error)=>{
        console.log('--getReportsMedical Error encountered');
        reject(error);
    });
};


var setForms = () => {
    return new Promise((resolve, reject) => {
        setFormsOptions().then(() => {
            setFormsQuestions().then(() => {
                getReportsMedical().then(() => {
                    resolve();
                });
            });
        });
    })
    .catch((error) => {
        console.log('--setFOrms Error encountered');
        reject(error);
    });
};

module.exports = {
    setFormsOptions,
    setFormsQuestions,
    setForms,
    getReportsMedical
}