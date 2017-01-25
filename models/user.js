// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define our user schema
var User = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    }
});

User.methods.verifyPassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Export the Mongoose model
module.exports = mongoose.model('User', User);