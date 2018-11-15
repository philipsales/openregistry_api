'use strict';

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;

var {Case, CaseError} = require('../../server/models/case');
var {Form, FormError} = require('../../server/models/form');
var {MedicalReport, MedicalReportError} = require('../../server/models/medicalreport');

const options   = require('./aggregates/medical.options');
const types = require('./aggregates/medical.types');
const questions = require('./aggregates/medical.questions');
const reportMedicalRaw = require('./aggregates/medical.raws');
const reportMedicalCount = require('./aggregates/medical.count');

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

var setFormsTypes = () => {

    return new Promise((resolve, reject) => {
        Form.aggregate(types,
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
        console.log('--setFOrmsTypes Error encountered');
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

var getReportsMedicalRaw = (parameters) => {

    return new Promise((resolve, reject) => {
        let form = parameters['form_name'];
        let script = reportMedicalRaw.setFoo(form);

        //Case.aggregate(reportMedicalRaw,
        Case.aggregate(script,
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

var getReportsMedicalCount = () => {

    return new Promise((resolve, reject) => {
        MedicalReport.aggregate(reportMedicalCount,
            function (err, result) {
                if (err instanceof MedicalReportError) {
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


var setReportRaw = (parameters) => {
    return new Promise((resolve, reject) => {
        setFormsOptions().then(() => {
            setFormsTypes().then(() => {
                setFormsQuestions().then(() => {
                    getReportsMedicalRaw(parameters).then(() => {
                        resolve();
                    });
                });
            });
        });
    })
    .catch((error) => {
        console.log('--setReport Raw Error encountered');
        reject(error);
    });
};

var setReportCount = (parameters) => {
    return new Promise((resolve, reject) => {
        setReportRaw(parameters).then(() => {
            getReportsMedicalCount().then(() => {
                resolve();
            });
        });
    })
    .catch((error) => {
        console.log('--setReport Count Error encountered');
        reject(error);
    });
}

module.exports = {
    setFormsOptions,
    setFormsTypes,
    setFormsQuestions,
    setReportRaw,
    setReportCount,
    getReportsMedicalRaw,
    getReportsMedicalCount
}