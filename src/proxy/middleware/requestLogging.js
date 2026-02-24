const { formattedLog } = require("../../utils/loggingUtils");

exports.requestLog = function () {
	function logRequest (req, res, next) {
		formattedLog (`${req.method}\t${req.url}`);
		next ();
	}

	return logRequest;
};