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
var Conversation = require('./app/models/conversation');
var ReadyToTok = require('./app/models/readyToTok');

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

/**
 * @api {get} / Test endpoint for API
 * @apiName Endpoint Tester
 */

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

/**
 * @api {post} /login Create new user or login
 * @apiName Login
 * @apiDescription If fbUserID does not exist, 
 * a new user will be created. If it does exist,
 * we return the userID
 *
 * @apiParam {String} fbUserID User's ID returned by Facebook.
 * @apiParam {String} token User's session token returned by Facebook.
 * @apiParam {Date} tokenExpires User's session token expiration date returned by Facebook.
 * @apiParam {String} Name User's name returned by Facebook.
 * @apiParam {String} facebookPhotoURL User's profile picture URL.
 *
 * @apiSuccess {String} message Success or error message.
 * @apiSuccess {Boolean} Success  Boolean that is true if no errors occurred.
 * @apiSuccess {Object} Contents  Only appears if no errors occur. Object contains returned data. 
 * @apiSuccess {String} userID  A property of Contents. UserID unique to our database that represents user.
 * @apiSuccess {Boolean} setupComplete  A property of Contents. Flag that is true if user as submitted a seed word.
 */

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
	});
	
/**
 * @api {post} /setupIsComplete Check if user has submitted a seed word
 * @apiName SetupIsComplete
 * @apiDescription Check if user has submitted a seed word. Error is returned 
 * if userID does not exist.
 *
 * @apiParam {String} userID UserID unique to our database that represents user.
 *
 * @apiSuccess {String} message Success or error message.
 * @apiSuccess {Boolean} Success  Boolean that is true if no errors occurred.
 * @apiSuccess {Object} Contents  Only appears if no errors occur. Object contains returned data. 
 * @apiSuccess {String} userID  A property of Contents. UserID unique to our database that represents user.
 * @apiSuccess {Boolean} setupComplete  A property of Contents. Flag that is true if user as submitted a seed word.
 */

router.route('/setupIsComplete')
	.post(function(req,res){
		var user = new User();
		user.userID = req.body.userID;

		User.findOne({'_id': user.userID}, function(err, person){
				if(err){
					Messenger.ErrorMessage(res, 'setup is complete', err);
					return
				}
				else if(person == null){
					Messenger.ErrorMessage(res, 'setup is complete', 'User not found');
					
				}
				else if(user.userID == person._id){
					Messenger.SuccessMessage(res, 'user found', {userID:person._id, setupComplete:person.setupComplete});
				}
		});
	});
	
// UPDATESEEDWORD
router.route('/updateSeedWord')
	.post(function(req,res){
		var user = new User();
		user.userID = req.body.userID;
		user.seedWord = req.body.seedWord;

		User.findOne({'_id': user.userID}, function(err, person){
				if(err){
					Messenger.ErrorMessage(res, 'update seed word', err);
					return
				}
				else if(person == null){
					Messenger.ErrorMessage(res, 'update seed word', 'User not found');
					
				}
				else if(user.userID == person._id){
					person.seedWord = user.seedWord;
					user.save(function(err, person){
						if(err){
							Messenger.ErrorMessage(res, 'seed word update', err);
						}
						else{
							Messenger.SuccessMessage(res, 'seed word update', {userID:person._id});
						}
					})
				}
		});
	});

// PROFILE
router.route('/profile')
	.post(function(req,res){
		var user = new User();
		user.userID = req.body.userID;

		User.findOne({'_id': user.userID}, function(err, person){
				if(err){
					Messenger.ErrorMessage(res, 'profile', err);
					return
				}
				else if(person == null){
					Messenger.ErrorMessage(res, 'profile', 'User not found');
					
				}
				else if(user.userID == person._id){
					Messenger.SuccessMessage(res, 'profile', {userID:person._id, facebookPhotoURL: person.facebookPhotoURL, name: person.name, myConversations: ReturnOnlyFinishedConversations(res, person.myConversations), inspiredConversations: ReturnOnlyFinishedConversations(res, person.inspiredConversations)});
				}
		});
	});


// READYTOTOK
router.route('/readyToTok')
	.post(function(req,res){
		var readyToTok = new ReadyToTok();
		readyToTok.userID = req.body.userID;
		readyToTok.longitude = req.body.longitude;
		readyToTok.latitude = req.body.latitude;
		readyToTok.submissionTime = (new Date()).getTime();
		readyToTok.conversationId = null;

		ReadyToTok.findOne({'_id': readyToTok.userID}, function(err, person){
			if(err){
				Messenger.ErrorMessage(res, 'ready to tok', err);
				return
			}
			else if(person == null){

				readyToTok.save(function(err, person){
					if(err){
						Messenger.ErrorMessage(res, 'ready to tok save error', err);
					}
					else{
						Messenger.SuccessMessage(res, 'ready to tok request added', {userID:person.userID});
					}
				})
			}
			else if(readyToTok.userID == person._id){
				Messenger.ErrorMessage(res, 'ready to tok', 'tok request in process already');
				
			}
			
		});
	});
	
// HELPER METHODS TO BE EXTRACTED
// ==============================================

	function ReturnOnlyFinishedConversations(res, convoList){
		newArr = [];
		for (var i = 0, len = convoList.length; i < len; i++) {
			Conversation.findOne({'_id': convoList[i]}, function(err, conversation) {
				if(err) {
					Messenger.ErrorMessage(res, 'return only finished conversations', err);
					return
				}
				else if(conversation == null){
					Messenger.ErrorMessage(res, 'return only finished conversations', 'No conversation with this ID was found: ' + convoList[i]);
				}
				else if(conversation == convoList[i])
				{
					if(conversation.finishedToking){
						newArr.push(convoList[i]);
					}
				}
			})
		}
		return newArr;
	}
	

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
//
