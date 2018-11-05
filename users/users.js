'use strict';

const {ObjectID} = require('mongodb');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mailer = require('nodemailer');
var express = require('express')
var router = express.Router();
const bodyParser = require('body-parser');

var {authenticate} = require('../server/middleware/authenticate');
var {User, UserError} = require('../server/models/user');
var {Role} = require('../server/models/role');

router.use(bodyParser.json());

router.post('/', (req, res) => {
    var body = _.pick(req.body, [
        'username', 
        'first_name', 
        'middle_name', 
        'last_name', 
        'gender', 
        'email', 
        'mobile_number', 
        'isDeleted', 
        'isActive', 
        'password', 
        'department',
        'roles'
    ]);
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

router.post('/forgot', (req, res) => {
    let body = _.pick(req.body, [
        'username'
    ]);

    let transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'angelomycar@gmail.com',
            pass: 'meSmashsta5024508592236'
        }
    });

    let tempath = path.join(__dirname, 'email.template.html');

    fs.readFile(tempath, 'utf8', (err, data) => {
        let template = handlebars.compile(data);
        
        let temp = Math.random().toString(36).substring(2);
        var data = {
            temp: temp
        };
        User.findOneAndUpdate({
            username: body.username
            }, {$set: {
                password: temp
            }})
            .then(user => {
                if (user) {
                    var emailToSend = template(data);
                    let mailOptions = {
                        from: `"Mycar Angelo Peña Chu" <angelomycar@gmail.com>`,
                        to: `${body.username}`,
                        subject: 'Biobank: Temporary Password',
                        // text: `Here is your temporary password: ${temp}`,
                        html: emailToSend
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                            res.status(400).send({success: false, user: user});
                        } else {
                            res.status(200).send({success: true, error: error});
                        }
                    });
                } else {
                    res.status(404).send({success: false, text: `Can't find user.`});
                }
            });
    });
});

router.post('/token', (req, res) => {
    var body = _.pick(req.body, ['username', 'password']);
    User.findByCredentials(body.username, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            let all_permissions = new Set();
            console.log()
            let promises = [];
            user.roles.map(role => {
                console.log(role, 'ROLE');
                promises.push(Role.findOne({rolename: role, isActive: true}));
            });

            Promise.all(promises).then(results => {
                console.log(results, 'PROMISES');
                results.map(this_role => {
                    console.log(this_role, 'MY ROLE');
                    if(this_role) {
                        this_role['permissions'].map(permission => {
                            all_permissions.add(permission);
                        });    
                    }
                });
                console.log(all_permissions, 'PERMISSION LAHAT')
                let permissions = Array.from(all_permissions);
                user['permissions'] = Array.from(all_permissions);
                console.log(user, 'OUT');
                res.status(200).send({user, token, permissions});
            }).catch((err) => {
                console.log(err, 'ignore');
            });
            
        });
    }).catch((err) => {
        console.log(err);
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
    var body = _.pick(req.body, ['first_name', 
    'middle_name', 
    'last_name', 
    'gender', 
    'email', 
    'department',
    'isDeleted', 
    'isActive', 
    'mobile_number', 
    'roles']);

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

router.patch('/me/:id/:changepass?', authenticate, (req, res) => {
    var id = req.params.id;
    var changepass = req.params.changepass;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if(req.user.id === id){
        var body = _.pick(req.body, ['first_name', 
        'middle_name', 
        'last_name', 
        'gender', 
        'email', 
        'mobile_number', 
        'password']);
        User.findOneAndUpdate({
            _id: id,
            isDeleted: false
        }, {
            $set: body
        }, {
            new: true
        }).then((user) => {
            if (user) {
                if (changepass) {
                    let transporter = mailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'angelomycar@gmail.com',
                            pass: 'meSmashsta5024508592236'
                        }
                    });
                    let tempath = path.join(__dirname, 'email.change.template.html');
                    fs.readFile(tempath, 'utf8', (err, data) => {
                        let template = handlebars.compile(data);
                        var emailToSend = template(user);
                        let mailOptions = {
                            from: `"Mycar Angelo Peña Chu" <angelomycar@gmail.com>`,
                            to: `"philip sales" <peejaysales@gmail.com>`,
                            subject: 'Biobank: Password Changed',
                            html: emailToSend
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                res.status(400).send({success: false, user: user});
                            } else {
                                res.status(200).send({success: true, error: error});
                            }
                        });

                    });                    
                }
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