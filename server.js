// Load required packages
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    userController = require('./controllers/user'),
    oauth2Controller = require('./controllers/oauth2'),
    clientController = require('./controllers/client'),
    authController = require('./controllers/auth');

mongoose.connect('mongodb://localhost:27017/nodeauth');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(passport.initialize());

var router = express.Router();

// Route to add new clients (if client auth secret is passed)
router.route('/api/client/add')
    .post(clientController.canCreateClient, userController.userExists, clientController.addClient);

// Route to add/update user
router.route('/api/user/add')
    .post(userController.getUser, userController.addUser)
    .put(userController.getUser, userController.updateUser);

router.route('/api/user')
    .get(passport.authenticate('bearer', {session: false}),
    function (req, res) {
        res.json({
            user_id: req.user._id,
            email: req.user.username
        });
    }
);

// Route to handle token and refresh-token request
router.route('/api/token')
    .post(oauth2Controller.token);

// Route for revoke token
router.route('/api/revoke')
    .post(authController.isBearerAuthenticated, oauth2Controller.revoke);

app.use(router);

app.listen(3000);