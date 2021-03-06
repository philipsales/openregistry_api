var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var tokenParam = req.header('Authorization');
    var token = tokenParam && tokenParam.split(' ')[1];
    if (token){
        User.findByToken(token).then((user) => {
            if (!user) {
                return Promise.reject();
            }
            req.user = user;
            req.token = token;
            next();
        }).catch((e) => {
            res.status(401).send();
        });
    } else {
        res.status(401).send();
    }
    
};

module.exports = {
    authenticate
}