const crypto = require ("crypto");
const { formattedErrorLog } = require ("../../utils/loggingUtils.js");

exports.payloadValidation = function (appSecret) {
	function validatePayload (req, res, next) {
		const signature = req.headers["x-hub-signature-256"];

		if (!signature) return res.status (400).send ("Signature missing");

		const digest = crypto
			.createHmac ("sha256", appSecret)
			.update (req.rawBody)
			.digest ("hex");
		const expectedSignature = `sha256=${digest}`;

		if (crypto.timingSafeEqual (Buffer.from (signature, 'utf-8'), Buffer.from (expectedSignature, 'utf-8'))) {
			next ();
			return;
		}

		res.status (403);
		formattedErrorLog ("Payload validation failed");
		res.end ("Payload validation failed");
	}

	return validatePayload;
}
