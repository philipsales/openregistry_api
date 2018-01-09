'use strict';

const {ObjectID} = require('mongodb');
const _ = require('lodash');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');

var {authenticate} = require('../server/middleware/authenticate');
var {User, UserError} = require('../server/models/user');

router.use(bodyParser.json());

router.post('/', (req, res) => {
    var body = _.pick(req.body, ['username', 'first_name', 'middle_name', 'last_name', 'gender', 'email', 'mobile_number', 'password']);
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

router.post('/token', (req, res) => {
    var body = _.pick(req.body, ['username', 'password']);
    User.findByCredentials(body.username, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.status(200).send({user, token});
        });
    }).catch((err) => {
        return res.status(400).send();
    })
});

router.delete('/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

router.get('/', authenticate, (req, res) => {
    User.find({isDeleted: false}).then((users) => {
        var data = users.map((user) => {
            var out = user.toJSON();
            delete out.roles;
            return out;
        });
        res.send({data});
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }
    User.findOne({
        _id: id,
        isDeleted: false
    }).then((user) => {
        if (user){
            res.send(user);
        } else {
            res.status(404).send();
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    User.findOneAndUpdate({
        _id: id,
        isDeleted: false
    }, {
        $set: {
            isDeleted: true       
        }
    }, {
        new: true
    }).then((user) => {
        if (user) {
            res.send(user);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['first_name', 'middle_name', 'last_name', 'gender', 'email', 'mobile_number', 'roles']);
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    User.findOneAndUpdate({
        _id: id,
        isDeleted: false
    }, {
        $set: body
    }, {
        new: true
    }).then((user) => {
        if (user) {
            res.send(user);
        } else {
            res.status(404).send();
        }
    }).catch((error) => {
        if (error instanceof UserError) {
            return res.status(400).send(JSON.parse(error.message));
        } else {
            console.log(error);
            return res.status(500).send(error);
        }
    });
});

router.get('/me/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if(req.user.id === id){
        return res.send(req.user);
    } else {
        return res.status(401).send();
    }
});

router.patch('/me/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if(req.user.id === id){
        var body = _.pick(req.body, ['first_name', 'middle_name', 'last_name', 'gender', 'email', 'mobile_number', 'password']);
        User.findOneAndUpdate({
            _id: id,
            isDeleted: false
        }, {
            $set: body
        }, {
            new: true
        }).then((user) => {
            if (user) {
                return res.send(user);
            } else {
                return res.status(404).send();
            }
        }).catch((error) => {
            return res.status(400).send();
        });
    } else {
        return res.status(401).send();
    }
});

module.exports = router