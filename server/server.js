require('./config/config');

const express = require('express');
var cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yargs = require('yargs');

const swaggerDocument = require('../swagger.json');
var {mongoose} = require('./db/mongoose');
var users = require('../users/users');
var permissions = require('../permissions/permissions');
var roles = require('../roles/roles');
var questions = require('../questions/questions');
var cases = require('../cases/cases');
var forms = require('../forms/forms');
var organizations = require('../organizations/organizations');
var departments = require('../departments/departments');
var databases = require('../databases/databases');
var consents = require('../consents/consents');
var fhir_resources = require('../fhir/resources/resources');
var icd_oncology = require('../icd/icdoncology/icdoncology');
var reports_medical = require('../reports/medical/medicalreport');
var mtas = require('../mtas/mtas');
var specs = require('../specs/specs');
var spectypes = require('../spectypes/spectypes');

const {populateTables} = require('./db/seeds');

const port = process.env.PORT;

var app = express();
app.use(cors())

app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    next();
});

app.use('/api-docs', 
        swaggerUi.serve, 
        swaggerUi.setup(swaggerDocument));

app.use('/users', users);
app.use('/permissions', permissions);
app.use('/roles', roles);
app.use('/questions', questions);
app.use('/cases', cases);
app.use('/forms', forms);
app.use('/organizations', organizations);
app.use('/departments', departments);
app.use('/databases', databases);
app.use('/consents', consents);
app.use('/reports', reports_medical);
app.use('/hl7', fhir_resources);
app.use('/icd', icd_oncology);
app.use('/mtas', mtas);
app.use('/specs', specs);
app.use('/spectypes', spectypes);

const argv = yargs.argv;
const command = process.argv[2];

if(command == 'db:seed') {
    console.log('Loading seeds');
    populateTables().then(() => {
        process.exit(0);
    });
} else {
    app.listen(port, () => {
        console.log(`Started on port ${port}`);
    });
}

module.exports = {
    app
}