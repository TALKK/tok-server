var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConversationSchema = new Schema({
	p1UserId: String,
	p2UserId: String,
	seedWord: String,
	imageLocation: String,
	p1Long: String,
	p2Long: String,
	p1Lat: String,
	p2Lat: String,
	meetingLong: String,
	meetingLat: String,
	finishedToking: Boolean,
	date: Date,
	inspiredBy: String
});

module.exports = mongoose.model('Conversation', ConversationSchema);