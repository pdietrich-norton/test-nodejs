/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    User = require('../models/user'),
    Client = require('../models/client'),
    AccessToken = require('../models/accessToken'),
    RefreshToken = require('../models/refreshToken'),
    bcrypt = require('bcrypt-nodejs');;


passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }

        // No user found with that username
        if (!user) { return done(null, false); }

        // Make sure the password is correct
        user.verifyPassword(password, function(err, isMatch) {
          if (err) { return done(err); }

          // Password did not match
          if (!isMatch) { return done(null, false); }

          // Success
          return done(null, user);
        });
      });
    }
));

// if login sessions are used, Serialize and deserialize userId for storing in sessions
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  User.findOne({username: id}, function (err, user) {
    done(err, user);
  })
});

passport.use(new BasicStrategy(
    function(username, password, done) {
        Client.findOne({ clientId: username }, function(err, client) {
            if (err) {
                return done(err);
            }

            if (!client) {
                return done(null, false);
            }

            if (client.clientSecret !== password) {
                return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {

        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
                return done(err);
            }

            if (!client) {
                return done(null, false);
            }

            if (client.clientSecret !== clientSecret) {
                return done(null, false);
            }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {
            if (err) {
                return done(err);
            }

            if (!token) {
                return done(null, false);
            }

            // check if token has expired and if so, delete it
            if( Math.round((Date.now()-token.created)/1000) > 3600 ) {
                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                        return done(err);
                    }
                });

                return done(null, false, { message: 'Token expired' });
            }

            User.findById(token.userId, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false, { message: 'Unknown user' });
                }

                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));

exports.isAuthenticated = passport.authenticate(['local', 'accessToken'], { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });