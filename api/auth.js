const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const util = require('../util');
const router = express.Router();


// Login
// 로그인과정은 아이디와 비밀번호가 일치함을 확인한 후에 jwt.sign함수를 통해 token을 생성하여 return하게된다
// jwt.sign은 payload, secretOrPrivateKey, options, callback 의 4개의 parameter를 전달받는다
// 1. paylaod
//    token에 저장될 정보, 로그인용으로 사용되는 경우 DB에서 유저를 특정할 수 있는 간결한 정보를
//    담고 있어야 하며, 민감한 정보는 저장해선 안된다.
// 2. secretOrPrivateKey
//    hash 생성에 사용되는 key문자열이다.
//    해독시 생성에 사용된 같은 문자열을 사용해야 해독할 수 있다.
// 3. options
//    hash 생성 알고리즘, token 유효기간 등을 설정할 수 있는 options다.
//    밑의 코드에는 24시간의 유효기간을 설정하였다.
// 4. callback
//    token 생성 후 실행되는 함수, error와 token 문자열을 parameter로 사용
router.post('/login', function(req, res, next) {
    let isValid = true;
    let validationError = {
        name: 'ValidationError',
        errors: {},
    };

    if (!req.body.username) {
        isValid = false;
        validationError.errors.username = { message: "Username is required!" };
    }
    if (!req.body.password) {
        isValid = false;
        validationError.errors.password = { message: "Password is required!" };
    }
    if (!isValid)
        return res.json(util.successFalse(validationError));
    else
        next();    
}, function(req, res, next) {
    User.findOne({ username: req.body.username })
        .select({ password: 1, username: 1, name: 1, email: 1, })
        .exec((err, user) => {
            if (err)
                return res.json(util.successFalse(err));
            else if (!user || !user.authenticate(req.body.password))
                return res.json(util.successFalse(null, "Username or Password is invalid"));
            else {
                let payload = {
                    _id: user._id,
                    username: user.username,
                };
                let secretOrPrivateKey = process.env.JWT_SECRET;
                let options = { expiresIn: 60*60*24 };
                jwt.sign(payload, secretOrPrivateKey, options, (err, token) => {
                    if (err) return res.json(util.successFalse(err));
                    res.json(util.successTrue(token));    
                });
            }        
        });
});

// me
// token을 해독해서 DB에서 user정보를 return 하는 API
router.get('/me', util.isLoggedIn, function(req, res, next) {
    User.findById(req.decoded._id)
        .exec((err, user) => {
            if (err || !user)
                return res.json(util.successFalse(err));
            res.json(util.successTrue(user));    
        });
});

// refresh
// token의 유효기간이 끝나기전에 새로운 토큰을 발행하는 API
router.get('/refresh', util.isLoggedIn, function(req, res, next) {
    User.findById(req.decoded._id)
        .exec((err, user) => {
            if (err || !user)
                return res.json(util.successFalse(err));
            else {
                let payload = {
                    _id: user._id,
                    username: user.username,
                };
                let secretOrPrivateKey = process.env.JWT_SECRET;
                let options = { expiresIn: 60*60*24 };
                jwt.sign(payload, secretOrPrivateKey, options, (err, token) => {
                    if (err) return res.json(util.successFalse(err));
                    res.json(util.successTrue(token));    
                });
            }    
        });
});


module.exports = router;