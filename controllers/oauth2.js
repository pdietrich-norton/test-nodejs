var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    crypto = require('crypto'),
    Client = require('../models/client'),
    User = require('../models/user'),
    AccessToken = require('../models/accessToken'),
    RefreshToken = require('../models/refreshToken'),
    utils = require('../utils');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Generic error handler
var errFn = function (cb, err) {
    if (err) {
        return cb(err);
    }
};

// Destroys any old tokens and generates a new access and refresh token
var generateTokens = function (data, done) {

    // curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done),
        refreshToken,
        refreshTokenValue,
        token,
        tokenValue;

    RefreshToken.remove(data, errorHandler);
    AccessToken.remove(data, errorHandler);

    tokenValue = crypto.randomBytes(256).toString('hex');
    refreshTokenValue = crypto.randomBytes(256).toString('hex');

    data.token = tokenValue;
    data.created = new Date(new Date().getTime() + (3600 * 1000)); // 1 hour expiration

    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

    refreshToken.save(errorHandler);

    token.save(function (err) {
        if (err) {
            log.error(err);
            return done(err);
        }
        done(null, tokenValue, refreshTokenValue, {
            'expires_in': 3600
        });
    });
};

var revokeToken = function(data, done) {

};

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false);
        }

        // Make sure the password is correct
        user.verifyPassword(password, function(err, isMatch) {
            if (err) { return done(err); }

            // Password did not match
            if (!isMatch) { return done(null, false); }
        });

        var model = {
            userId: user._id,
            clientId: client.clientId
        };

        generateTokens(model, done);
    });

}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, function(err, token) {
        if (err) {
            return done(err);
        }

        if (!token) {
            return done(null, false);
        }

        User.findById(token.userId, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            var model = {
                userId: user._id,
                clientId: client.clientId
            };

            generateTokens(model, done);
        });
    });
}));

// token endpoint
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {session: false}),
    server.token(),
    server.errorHandler()
];

exports.revoke = function (req, res) {
    var hdr = req.get("Authorization");
    var token  = hdr.replace('Bearer ', '');
    res.send({"token":token});
    AccessToken.remove();
    AccessToken.remove(function (err, product) {
        if (err) return handleError(err);
        Product.findById(product._id, function (err, product) {
            console.log(product) // null
        })
    })
};