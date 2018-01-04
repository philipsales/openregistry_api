require('./config/config');

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('../swagger.json');
var {mongoose} = require('./db/mongoose');
var users = require('../users/users')

var app = express();
const port = process.env.PORT;

app.use('/api-docs', 
        swaggerUi.serve, 
        swaggerUi.setup(swaggerDocument));

app.use('/users', users);

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}