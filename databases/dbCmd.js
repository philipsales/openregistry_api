'use strict';

var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;
var icd_oncology = require('./../server/db/icd-oncology.v3.json');

var dbOptions = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    dbURI: process.env.MONGODB_URI,
    database: process.env.DATABASE,
    dumpPath: 'dump/'
}

const dbDump = () => {
    var date = new Date(Date.now());

    var local = "en-us";
    var backupYear = date.getFullYear(); 
    var backupPath = dbOptions.dumpPath + 
                     date.getFullYear() + '-' + 
                     date.getMonth() + '-' +
                     date.getDay() + '-' +
                     date.getMilliseconds() +  '.archive' ;
    
    var cmd = "mongodump " +
              " --host " + dbOptions.host +
              " --port " + dbOptions.port +
              " --username " + dbOptions.username   +
              " --password " + dbOptions.password +
              " --authenticationDatabase " + dbOptions.database +
              " --db " + dbOptions.database + 
              " --archive=" + backupPath +  
              " --gzip" ;


    return new Promise((resolve, reject) => {
        exec(cmd, function(error, stdout, stderr){
            console.log(stderr);
            if(error) console.log('--CMD Error-- Error encountered in Cmd: ',error);
        });
        resolve(backupPath);
    }).catch((error) => {
        console.log('--MongoDump-- Error encountered in Promise', error);
        reject();
    });
};

const dbRestore = (path) => {
  
    var cmd = "mongorestore" +
              " --host " + dbOptions.host +
              " --port " + dbOptions.port +
              " --username " + dbOptions.username   +
              " --password " + dbOptions.password +
              " --authenticationDatabase " + dbOptions.database +
              " --db=" + "'" + dbOptions.database +  "'" +
              " --nsExclude=" + "'" + dbOptions.database+ ".permissions" + "'" +
              " --nsExclude=" + "'" + dbOptions.database+ ".databases" + "'" +
              //" --nsExclude=" + "'" + dbOptions.database+ ".roles" + "'" +
              " --nsExclude=" + "'" + dbOptions.database+ ".users" + "'" +
              " --nsExclude=" + "'" + dbOptions.database+ ".icdoncologies" + "'" +
              " --nsExclude=" + "'" + dbOptions.database+ ".naaccr" + "'" +
              " --nsExclude=" + "'" + dbOptions.database+ ".fhirresources" + "'" +
              " --archive=" + path  +  
              " --drop "  + path  +
              " --gzip ";
    console.log('dbRESTORE: --',cmd);

    return new Promise((resolve, reject) => {
        exec(cmd, function(error, stdout, stderr){
            console.log(stderr);
            if(error) console.log('--CMD Error-- Error encountered in Cmd: ',error);
        });
        resolve();
    }).catch((error) => {
        console.log('--MongoRestore-- Error encountered in Promise', error);
        reject();
    });

};

const dbImport = (path, collection) => {
  
    var cmd = "mongoimport" +
              " --host " + dbOptions.host +
              " --port " + dbOptions.port +
              " --username " + dbOptions.username  +
              " --password " + dbOptions.password +
              " --authenticationDatabase " + dbOptions.database +
              " --db=" + "'" + dbOptions.database +  "'" +
              " --collection=" + "'" + collection +  "'" +
              " --drop " +
              " --file " + path + 
              " --jsonArray";

              
    return new Promise((resolve, reject) => {
        exec(cmd, function(error, stdout, stderr){
            console.log(stderr);
            if(error) console.log('--CMD Error-- Error encountered in Cmd: ',error);
        });
        resolve();
    }).catch((error) => {
        console.log('--MongoImport -- Error encountered in Promise', error);
        reject();
    });

};

module.exports = {
   dbDump,
   dbRestore, 
   dbImport
} 