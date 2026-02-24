const { getValidIntercomIPs } = require("../thirdparty/intercom/intercomConfig");

exports.intercomIPValidation = function () {
	function validateIntercomIP (req, res, next) {
		// If request IP is one of the valid intercom IPs
		if (!getValidIntercomIPs ().includes (req.headers["x-forwarded-for"])) {
			res.sendStatus (403);
			return;
		}

		next();
	}

	return validateIntercomIP;
};