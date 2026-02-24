const { intercomClient } = require("../intercomConfig");

exports.createIntercomConversation = async function (adminId, conversationId, messageContent) {
	return exports.sendIntercomAdminMessage (adminId, conversationId, messageContent, true);
};

exports.sendIntercomUserMessage = async function (userId, messageContent) {
	return intercomClient.messages.create ({
		message_type: "inapp",
		body: messageContent,
		from: {
			type: "user",
			id: userId
		}
	});
};

exports.sendIntercomAdminMessage = async function (adminId, messageContent, createConversation = false) {
	return intercomClient.messages.create ({
		message_type: "inapp",
		body: messageContent,
		from: {
			type: "admin",
			id: adminId
		},
		create_conversation_without_contact_reply: createConversation
	});
};