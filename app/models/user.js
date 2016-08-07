var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	token: String,
	tokenExpires: Date,
	name: String,
	fbUserID: String,
	facebookPhotoURL: String,
	setupComplete: Boolean,
	seedWord: String,
	userID: String,
	conversationSeen: [String],
	myConversations: [String],
	inspiredConversations: [String]
});

module.exports = mongoose.model('User', UserSchema);