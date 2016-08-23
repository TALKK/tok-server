var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReadyToTokSchema = new Schema({
	userId: String,
	longitude: String,
	latitude: String,
	submissionTime: Date,
	conversationID: String
});




module.exports = mongoose.model('ReadyToTok', ReadyToTokSchema);