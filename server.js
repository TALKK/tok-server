var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

var databaseURL = 'mongodb://test1:test1@ds011873.mlab.com:11873/rumble';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;   
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// connect to our database
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


// REGISTER OUR ROUTES
// ==============================================
app.use('/api', router);

// START THE SERVER
// ==============================================
var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(port, ipaddress);
console.log('Magic happens on port ' + port);