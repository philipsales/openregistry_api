require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const _ = require('lodash');

const swaggerDocument = require('../swagger.json');
var {mongoose} = require('./db/mongoose');
var {authenticate} = require('./middleware/authenticate');
var {User, UserError} = require('./models/user');

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
        return res.status(201).send({user,token});
    }).catch((error) => {
        if (error instanceof UserError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

app.post('/users/token', (req, res) => {
    var body = _.pick(req.body, ['username', 'password']);
    User.findByCredentials(body.username, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.status(200).send({user, token});
        });
    }).catch((err) => {
        return res.status(400).send();
    })
});

app.delete('/users/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.get('/users', authenticate, (req, res) => {
    User.find().then((users) => {
        
        var data = users.map((user) => user.toJSON());
        console.log(data);
        console.log('---------------------------');
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}