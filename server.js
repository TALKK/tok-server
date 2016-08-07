var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var fs = require('fs');
var databaseURL = 'mongodb://tokuser:rabish123@ds145295.mlab.com:45295/tok';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;   
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// Initialize our schemas
var User = require('./app/models/user');

// Initialize our helper functions
var Messenger = require('./helpers/messenger');

// Connect to our database
mongoose.connect(databaseURL, function (error) {
    // Do things once connected
    if (error) {
        console.log('Database error or database connection error ' + error);
    }
    console.log('Database state is ' + mongoose.connection.readyState);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// ROUTES FOR OUR API
// ==============================================
var router = express.Router();
var router2 = express.Router();
            
            router2.get('/', function (req, res) {
                res.setHeader('Content-Type', 'text/html');
                res.send(fs.readFileSync('./public/index.html'));
            });

// middleware that logs all requests
router.use(function(req, res, next){
	console.log('Something is happening.');
	// go to the next route!
	next();
});

// ROUTES FOR OUR API
// ==============================================

// test route
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// LOGIN
router.route('/login')
	.post(function(req,res){
		var user = new User();
		user.fbUserID = req.body.fbUserID;
		user.token = req.body.token;

		User.findOne({'fbUserID': user.fbUserID}, function(err, person){
				if(err){
					Messenger.ErrorMessage(res, 'login', err);
					return
				}
				else if(person == null){
					user.name = req.body.name;
					user.token = req.body.token;
					user.setupComplete = false;
					user.seedWord = null;
					user.facebookPhotoURL = req.body.facebookPhotoURL;
					user.save(function(err, person){
						if(err){
							Messenger.ErrorMessage(res, 'user creation', err);
						}
						else{
							Messenger.SuccessMessage(res, 'user creation', {userID:person._id, setupComplete:person.setupComplete});
						}
					})
				}
				else if(user.fbUserID == person.fbUserID){
					Messenger.SuccessMessage(res, 'user found', {userID:person._id, setupComplete:person.setupComplete});
				}
		});
	})


// REGISTER OUR ROUTES
// ==============================================
app.use('/api', router);
app.use('/', router2);
            app.use('/',express.static('public'));

// START THE SERVER
// ==============================================
var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(port, ipaddress);
console.log('Magic happens on port ' + port);