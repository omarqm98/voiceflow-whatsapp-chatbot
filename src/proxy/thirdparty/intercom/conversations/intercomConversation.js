const { formattedErrorLog } = require("../../../../utils/loggingUtils");
const { intercomClient } = require("../intercomConfig");

exports.replyIntercomConversationAsUser = function (conversationId, senderId, messageBody, attachments = null, options = null, messageType = "comment") {
	return replyIntercomConversation (conversationId, senderId, messageBody, "user", attachments, options, messageType);
};

exports.replyIntercomConversationAsAdmin = function (conversationId, senderId, messageBody, attachments = null, options = null, messageType = "comment") {
	return replyIntercomConversation (conversationId, senderId, messageBody, "admin", attachments, options, messageType);
};

async function replyIntercomConversation (conversationId, senderId, messageBody, type, attachments, options, messageType) {
	try {
		const replyBody = {
			message_type: messageType,
			type: type
		};

		if (messageType === "comment") replyBody.body = messageBody;
		
		if (type === "admin") replyBody.admin_id = senderId;
		else if (type === "user") replyBody.user_id = senderId;

		if (attachments) replyBody.attachment_urls = attachments;
		if (options) replyBody.reply_options = options;

		await intercomClient.conversations.reply ({
			conversation_id: conversationId,
			body: replyBody
		});
	} catch (err) {
		formattedErrorLog (err);
	}
}

exports.assignConversationToAdmin = function (conversationId, adminId) {
	return intercomClient.conversations.manage ({
		conversation_id: conversationId,
		body: {
			message_type: "assignment",
			type: "admin",
			admin_id: process.env.INTERCOM_DEFAULT_ADMIN_ID,
			assignee_id: adminId
		}
	});
};