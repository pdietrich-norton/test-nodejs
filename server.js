// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var userController = require('./controllers/user');
var authController = require('./controllers/auth');
var oauth2Controller = require('./controllers/oauth2');
var clientController = require('./controllers/client');

mongoose.connect('mongodb://localhost:27017/nodeauth');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Use express session support because OAuth2orize requires it
app.use(session({
    secret: 'imgettingamoderatelysevereheadache',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());

var router = express.Router();

// Route to add new clients (if client auth secret is passed)
router.route('/api/client')
    .post(clientController.canCreateClient, userController.userExists, clientController.addClient);

// Route to add/update user
router.route('/api/user')
    .post(userController.getUser, userController.addUser)
    .put(userController.getUser, userController.updateUser);

/*
// AUTH
// Create endpoint handlers for oauth2 authorize
router.route('/api/oauth2/authorize')
    .get(authController.isAuthenticated, oauth2Controller.authorization)
    .post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.route('/api/oauth2/token')
    .post(authController.isClientAuthenticated, oauth2Controller.token);
*/


app.use(router);

app.listen(3000);