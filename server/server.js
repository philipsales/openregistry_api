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

const {populateTables} = require('./db/seeds');

const port = process.env.PORT;

var app = express();
app.use(cors())

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