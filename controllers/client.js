// Load required packages
var Client = require('../models/client');
var User = require('../models/user');

// Create new client
exports.addClient = function (req, res) {
    var utils = require('../utils');

    // Create a new instance of the Client model
    var client = new Client();

    // Set the client properties that came from the POST data
    client.name = req.body.name;
    client.userId = req.body.userId;
    client.id = utils.uid(8);
    client.secret = utils.uid(36);

    // Save the client and check for errors
    client.save(function (err) {
        if (err)
            return res.send(err);

        res.status(200).send({result: "Client successfully added"});
    });
};

// Can user create Client key/secret?
exports.canCreateClient = function (req, res, next) {
    if (req.body.secret !== "clientauthstring") {
        res.sendStatus(401);
    } else {
        next();
    }
};
