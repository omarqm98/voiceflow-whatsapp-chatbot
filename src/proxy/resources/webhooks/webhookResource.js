const express = require ("express");
const { handleWabWebhookEvent, handleIntercomWebhookEvent } = require("./services/webhookService");
const { requestLog } = require("../../middleware/requestLogging");
const { formattedLog } = require("../../../utils/loggingUtils");
const { payloadValidation } = require("../../middleware/payloadValidation");
const { intercomIPValidation } = require("../../middleware/intercomIPValidation");

const webhookRouter = express.Router ();

webhookRouter.use (requestLog ());

webhookRouter.get ("/whatsapp-business", (req, res) => {
	const challenge = req.query["hub.challenge"];
	const verifyToken = req.query["hub.verify_token"];

	if (verifyToken !== process.env.META_WEBHOOK_VERIFICATION_TOKEN) {
		res.status (403);
		res.end ("Verification token is invalid");
		return;
	}

	if (!challenge) {
		res.status (400);
		res.end ("No challenge received");
		return;
	}

	res.status (200);
	res.end (challenge);
});

webhookRouter.post ("/whatsapp-business", /*payloadValidation (process.env.META_APP_SECRET),*/ (req, res) => {
	handleWabWebhookEvent (req.body);
	res.sendStatus (200);
	formattedLog (`${res.statusCode}\t${res.statusMessage}`);
});

webhookRouter.post ("/intercom", intercomIPValidation (), (req, res) => {
	handleIntercomWebhookEvent (req.body);
	res.sendStatus (200);
	formattedLog (`${res.statusCode}\t${res.statusMessage}`);
});

module.exports = webhookRouter;