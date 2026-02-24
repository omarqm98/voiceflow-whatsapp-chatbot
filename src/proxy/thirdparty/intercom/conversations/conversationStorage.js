const { formattedErrorLog } = require("../../../../utils/loggingUtils");
const { setRedisHash, deleteRedisKey, getRedisHashAll } = require("../../redis/services/redisService");
const StoredConversation = require("./models/StoredConversation");

function generateConversationKey (userPhoneNumberId) {
	return `intercom-conversation-${userPhoneNumberId}`;
}

exports.storeIntercomConversation = async function (conversationId, adminId, contactId, businessPhoneNumberId, userPhoneNumberId) {
	try {
		const storedConversation = new StoredConversation ({ conversationId, adminId, contactId, businessPhoneNumberId, userPhoneNumberId });
		return setRedisHash (generateConversationKey (userPhoneNumberId), storedConversation.toFieldArray ());
	} catch (err) {
		formattedErrorLog (err);
	}
};

exports.getStoredIntercomConversation = async function (userPhoneNumberId) {
	return new StoredConversation (await getRedisHashAll (generateConversationKey (userPhoneNumberId)));
};

exports.deleteIntercomConversation = async function (userPhoneNumberId) {
	return deleteRedisKey (generateConversationKey (userPhoneNumberId));
};