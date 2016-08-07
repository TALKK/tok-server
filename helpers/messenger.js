var messenger = {
	SuccessMessage: function(res, message, obj){
		res.json({message: 'Success in ' + message, Success: true, Contents: obj});
	},

	ErrorMessage: function(res, message, err){
		res.json({message: 'Error encountered at ' + message + '. Error is ' + err, Success: false});
		console.log('Error encountered at ' + message + '. Error is ' + err);
	}
};

module.exports = messenger;