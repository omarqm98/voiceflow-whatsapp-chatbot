const { formattedLog, formattedErrorLog, formattedWarnLog } = require("../../../../utils/loggingUtils");
const { handleIntercomAssignedEvent, handleIntercomClosedEvent, handleIntercomReplyEvent } = require("./intercom/intercomService");
const { handleWabMessageEvent } = require("./wab/wabService");

const wabEventFields = {
	MESSAGE: "messages"
};

exports.handleWabWebhookEvent = async function (event) {
	try {
		switch (event.entry[0].changes[0].field) {
			case wabEventFields.MESSAGE:
				return handleWabMessageEvent (event);

			default:
				formattedLog (`Unhandled webhook event of type: ${event.entry[0].changes[0].field}`);
		}
	} catch (err) {
		formattedErrorLog (err);
	}
}

/* All others are unhandled */
const intercomEventTopics = {
	conversationAdminReplied: "conversation.admin.replied",
	conversationAdminAssigned: "conversation.admin.assigned",
	conversationAdminClosed: "conversation.admin.closed"
};

exports.handleIntercomWebhookEvent = async function (event) {
	try {
		switch (event.topic) {
			case intercomEventTopics.conversationAdminAssigned:
				handleIntercomAssignedEvent (event);
				break;

			case intercomEventTopics.conversationAdminClosed:
				handleIntercomClosedEvent (event);
				break;

			case intercomEventTopics.conversationAdminReplied:
				handleIntercomReplyEvent (event);
				break;

			default:
				formattedWarnLog (`No handler for event topic: ${event.topic}`);
				break;
		}
	} catch (error) {
		formattedErrorLog (err);
	}
};