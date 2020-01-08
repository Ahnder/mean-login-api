const express = require('express');
const router = express.Router();
const User = require('../models/user');
const util = require('../util');


// Index
router.get('/', util.isLoggedIn, function(req, res, next) {
    User.find({})
        .sort({ username: 1 })
        .exec((err, users) => {
            res.json(err || !users ? util.successFalse(err) : util.successTrue(users));
        });
});

// Create
router.post('/', function(req, res, next) {
    let newUser = new User(req.body);
    newUser.save((err, user) => {
        res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
    });
});

// Show
router.get('/:username', util.isLoggedIn, function(req, res, next) {
    User.findOne({ username: req.params.username })
        .exec((err, user) => {
            res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
        });
});

// Update
router.put('/:username', util.isLoggedIn, checkPermission, function(req, res, next) {
    User.findOne({ username: req.params.username })
        .select({ password: 1 })
        .exec((err, user) => {
            if (err || !user)
                return res.json(util.successFalse(err));
            
            // update user object
            user.originalPassword = user.password;
            user.password = req.body.newPassword ? req.body.newPassword : user.password;
            for (var p in req.body) {
                user[p] = req.body[p];
            }

            // save updated user
            user.save((err, user) => {
                if (err || !user)
                    return res.json(util.successFalse(err));
                else
                    user.password = undefined;
                    res.json(util.successTrue(user));    
            });
        });
});

// Destroy
router.delete('/:username', util.isLoggedIn, checkPermission, function(req, res, next) {
    User.findOneAndRemove({ username: req.params.username })
        .exec((err, user) => {
            res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
        });
});


module.exports = router;

// private functions

// checkPermission
function checkPermission(req, res, next) {
    User.findOne({ username: req.params.username }, (err, user) => {
        if (err || !user) 
            return res.json(util.successFalse(err));
        else if (!req.decoded || user._id != req.decoded._id)
            return res.json(util.successFalse(null, "You don\'t have permission"));
        else 
            next();    
    });
}