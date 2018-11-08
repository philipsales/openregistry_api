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
//const reportMedicalRaw = require('./aggregates/medical.raw');
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

var getReportsMedicalRaw = () => {

    return new Promise((resolve, reject) => {
        var script = reportMedicalRaw.setFoo('Breast Cancer Form');
        console.log('-----getReportsMedicalRaw----');

        Case.aggregate(script,
            function (err, result) {
                if (err instanceof CaseError) {
                    console.log(err);
                    reject(err);
                    return err;
                } 
                else {
                    console.log(result,'--raw-results---',result);
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

var getReportsMedicalRaw1 = () => {

    return new Promise((resolve, reject) => {
        var script = reportMedicalRaw.setFoo;

        Case.aggregate(reportMedicalRaw,
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
        console.log('-----getReportsMedicalCount----');
        MedicalReport.aggregate(reportMedicalCount,
            function (err, result) {
                if (err instanceof MedicalReportError) {
                    console.log('---error---');
                    console.log(err);
                    reject(err);
                    return err;
                } 
                else {
                    console.log('---results---',result);
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


var setReportRaw = () => {
    return new Promise((resolve, reject) => {
        setFormsOptions().then(() => {
            setFormsTypes().then(() => {
                setFormsQuestions().then(() => {
                    getReportsMedicalRaw().then(() => {
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

/*
var setReportCount = () => {
    return new Promise((resolve, reject) => {
        setReportRaw().then(() => {
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
*/
const setReportCount = () => {
    var report_medical_count = new Promise((resolve, reject) => {
        setReportRaw().then(() => {
            getReportsMedicalCount().then(() => {
                resolve();
            })
        })
    }).catch((error) => {
        console.log('--setReport Count Error encountered');
        reject(error);
    });

    return Promise.all([
        report_medical_count
    ])
}

module.exports = {
    setFormsOptions,
    setFormsTypes,
    setFormsQuestions,
    setReportRaw,
    setReportCount,
    getReportsMedicalRaw,
    getReportsMedicalRaw1,
    getReportsMedicalCount
}