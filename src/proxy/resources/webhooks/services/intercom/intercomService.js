const { formattedErrorLog, formattedLog } = require("../../../../../utils/loggingUtils");
const { storeIntercomConversation, deleteIntercomConversation, getStoredIntercomConversation } = require("../../../../thirdparty/intercom/conversations/conversationStorage");
const { patchVoiceflowStateByUserId } = require("../../../../thirdparty/voiceflow/voiceflowRequest");
const { sendWhatsappMessageRequest, sendWhatsappMediaRequestByUrl } = require("../../../../thirdparty/whatsapp/whatsappRequest");
const { getIntercomReplyAttachments, getIntercomReplyImageUrls, getIntercomReplyText } = require("./intercomWebhookUtils");

exports.handleIntercomReplyEvent = async function (event) {
	try {
		const userExternalId /* Phone Number */ = event.data.item.contacts.contacts[0].external_id;
		const storedConversation = await getStoredIntercomConversation (userExternalId);
		const wabAccountId = process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID;

		const attachments = getIntercomReplyAttachments (event);
		const imageUrls = getIntercomReplyImageUrls (event);
		const text = getIntercomReplyText (event);

		if (attachments) {
			throw new Error ("No handling of document attachments yet");
		}

		if (imageUrls) {
			imageUrls.forEach (async url => {
				await sendWhatsappMediaRequestByUrl (wabAccountId, userExternalId, url, text);
			});
		}

		if (text) {
			text.forEach (async text => {
				await sendWhatsappMessageRequest (wabAccountId, userExternalId, text);
			});
		}

		formattedLog (`Admin responded to ${userExternalId} with image urls: ${imageUrls} and text: ${text}`);
	} catch (err) {
		formattedErrorLog (err);
	}
};

exports.handleIntercomAssignedEvent = async function (event) {
	try {
		const conversationId = event.data.item.id;
		const contactId = event.data.item.contacts.contacts[0].id;
		const userExternalId /* Phone Number */ = event.data.item.contacts.contacts[0].external_id;
		const adminAssigneeId = event.data.item.admin_assignee_id;

		await storeIntercomConversation (conversationId, adminAssigneeId, contactId, process.env.BUSINESS_ACCOUNT_ID, userExternalId);
	} catch (err) {
		formattedErrorLog (err);
	}
};

exports.handleIntercomClosedEvent = async function (event) {
	try {
		const userExternalId /* Phone number */ = event.data.item.contacts.contacts[0].external_id;
		const wabAccountId = process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID;

		await deleteIntercomConversation (userExternalId);
		await sendWhatsappMessageRequest (wabAccountId, userExternalId, "El asesor ha cerrado la interacción. A partir de ahora continuarás hablando con el asistente automático");
		//lift handoff
		patchVoiceflowStateByUserId (userExternalId, { "hand_off_active": "no" });

		formattedLog (`Admin has closed conversation with ${userExternalId}`);
	} catch (err) {
		formattedErrorLog (err);
	}
};