require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const _ = require('lodash');

const swaggerDocument = require('../swagger.json');
var {User} = require('./models/user');
var {mongoose} = require('./db/mongoose');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['username', 'fullname', 'password']);
    var user = new User(body);
    user.save().then((saved_user) => {
        return saved_user.generateAuthToken();
    }).then((token) => {
        return res.header('jwt', token).status(201).send(user);
    }).catch((e) => {
        console.log(e);
        return res.status(400).send(e);
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}