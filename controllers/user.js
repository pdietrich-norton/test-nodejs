// Load required packages
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

// Create endpoint /api/users for POST
exports.addUser = function (req, res) {
    // hash password before saving
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    if (req.found) {
        res.status(400).send({result: "User already exists, cannot add"});
        return;
    }

    // Add user
    new User({
        username: req.body.username,
        password: hash,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        updated_at: new Date().toUTCString()
    }).save(function (err) {
            if (err) {
                return res.send(err);
            }

            res.status(200).send({result: "User successfully added"});
        });

};

// Create endpoint /api/users for POST
exports.updateUser = function (req, res) {
    // hash password before saving
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    // Update user
    if (!req.found) {
        res.status(400).send({result: "User does not exist, cannot update"});
        return;
    }
    User.findOneAndUpdate(
        {username: req.body.username},
        {
            password: hash,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            updated_at: new Date().toUTCString()
        },
        function (err) {
            if (err) {
                return res.send(err);
            }

            res.status(200).send({result: "User successfully updated"});
        }
    );

};

// Get user by username
exports.getUser = function (req, res, next) {
    User.find({username: req.body.username}, function (err, user) {
        if (err) {
            return res.send(err);
        }

        req.found = (user.length) ? true : false;

        next();
    });
};

// Get user by userId
exports.userExists = function (req, res, next) {
    User.find({_id: req.body.userId}, function (err, user) {
        if (err) {
            return res.send(err);
        }

        if (user.length > 0) {
            next();
        } else {
            res.status(400).send({result: "User does not exist"});
        }
    });
};
