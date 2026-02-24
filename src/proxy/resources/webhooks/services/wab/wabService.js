const { sendVoiceflowInteractRequest, deleteVoiceflowStateRequest, sendVoiceflowInteractChoiceRequest, sendVoiceflowInteractEventRequest, putVoiceflowTranscriptRequest, getVoiceflowStateByUserId, patchVoiceflowStateByUserId } = require("../../../../thirdparty/voiceflow/voiceflowRequest");
const { sendWhatsappMessageRequest, getWhatsappMediaRequest, sendWhatsappInteractiveMessageRequest, sendWhatsappMediaRequestByUrl } = require("../../../../thirdparty/whatsapp/whatsappRequest");
const { appendGlobalBuffer, getGlobalBuffer, clearGlobalBuffer, generateBufferKey } = require("../../../../../utils/bufferUtils");
const { formattedLog, formattedErrorLog } = require("../../../../../utils/loggingUtils");
const { setGlobalTimeout, generateTimeoutKey, clearGlobalTimeout, getGlobalTimeout } = require("../../../../../utils/timeoutUtils");
const { cleanVoiceflowMessageForWhatsapp, choiceToInteractiveButtons } = require("../../../../../utils/voiceflowUtils");
const { getStoredIntercomConversation, storeIntercomConversation } = require("../../../../thirdparty/intercom/conversations/conversationStorage");
const { replyIntercomConversationAsUser, assignConversationToAdmin, replyIntercomConversationAsAdmin } = require("../../../../thirdparty/intercom/conversations/intercomConversation");
const { sendIntercomUserMessage, sendIntercomAdminMessage } = require("../../../../thirdparty/intercom/messages/intercomMessage");
const { createIntercomContact, getIntercomContactByExternalId } = require("../../../../thirdparty/intercom/contacts/intercomContact");
const { generateHandoffMessage } = require("../intercom/intercomWebhookUtils");
const { isEmptyString } = require("../../../../../utils/stringUtils");
const { parsePhoneNumber } = require("libphonenumber-js/min");
const { createAirtableRecord } = require("../../../../thirdparty/airtable/airtableRequest");

const sessionEndTimeout = 24 * 60 * 60 * 1000; // 24h
const bufferFlushTimeout = 7 * 1000; // 5s
const maxRetries = 3;

let handoff = false;

exports.handleWabMessageEvent = async function (event) {
	try {
		const entryChange = event.entry[0].changes[0];
		let messageBody, messageImageId, messageImageUrl, messageDocumentUrl, buttonId, buttonLabel;

		if (!entryChange.value.messages || entryChange.value.messages.length === 0) return;

		const senderId = entryChange.value.messages[0].from;
		const receiverId = entryChange.value.metadata.phone_number_id;

		let senderName;
		if (entryChange.value.contacts && entryChange.value.contacts.length !== 0 && entryChange.value.contacts[0].profile)
			senderName = entryChange.value.contacts[0].profile.name;
		else
			senderName = "Sin nombre"

		if (!getGlobalTimeout (generateTimeoutKey (senderId))) {	// If there is no global timeout, a new conversation is starting
			createAirtableRecord (process.env.AT_CONVERSATION_TABLE_ID, {
				phoneNumber: parsePhoneNumber (`+${senderId}`).nationalNumber,
				//createdAt: new Date ().toISOString (),
				name: senderName
			})
				.then (() => formattedLog (`Se registró el inicio de una nueva conversación con ${senderId} (${senderName})`))
				.catch (err => formattedErrorLog (err));
		}

		const dialogState = (await getVoiceflowStateByUserId (senderId)).data;
		let handoff = false;
		if (dialogState.variables) {
			if (isEmptyString (dialogState.variables.wapPhone)) {
				patchVoiceflowStateByUserId (senderId, { "wapPhone": parsePhoneNumber (`+${senderId}`).nationalNumber });
				formattedLog (`Almacenando por primera vez información de usuario: ${senderName} con número ${senderId}`);
			}
			handoff = dialogState.variables.hand_off_active === "yes";
		} else {
			patchVoiceflowStateByUserId (senderId, { "wapPhone": parsePhoneNumber (`+${senderId}`).nationalNumber });
		}

		const storedConversation = await getStoredIntercomConversation (senderId);

		/*if (senderId !== "51989040134" && senderId !== "51906399458") {
			return;
		}*/

		switch (entryChange.value.messages[0].type) {
			case "text":
				messageBody = entryChange.value.messages[0].text.body;
				break;

			case "image":
				const image = entryChange.value.messages[0].image;
				messageImageId = image.id;
				
				messageImageUrl = (await getWhatsappMediaRequest (messageImageId)).data.url;
				messageBody = `${image.caption ? image.caption : ""} (${messageImageUrl})`;
				break;

			case "document":
				const document = entryChange.value.messages[0].document;
				const messageDocumentId = document.id;
				
				messageDocumentUrl = (await getWhatsappMediaRequest (messageDocumentId)).data.url;
				messageBody = `${document.caption ? document.caption : ""} (${messageDocumentUrl})`;
				break;

			case "interactive":
				const button = entryChange.value.messages[0].interactive.button_reply;

				buttonId = button.id;
				buttonLabel = button.title;

				formattedLog (`Sender with ID ${senderId} and name '${senderName}' sent: ${JSON.stringify (entryChange.value.messages[0])}`);

				if (storedConversation.open) {
					await replyIntercomConversationAsUser (storedConversation.conversationId, storedConversation.userPhoneNumberId, wrapUserMessage (button.title), messageImageId ? [ `${process.env.META_MEDIA_PATH}/${messageImageId}` ] : null);
				} else {
					let contact = await getIntercomContactByExternalId (senderId);

					if (!contact) contact = await createIntercomContact (senderId, senderName);

					const message = await sendIntercomUserMessage (contact.id, wrapUserMessage (button.title));
					//await assignConversationToAdmin (message.conversation_id, process.env.INTERCOM_DEFAULT_ADMIN_ID);
					await storeIntercomConversation (message.conversation_id, null, contact.id, process.env.BUSINESS_ACCOUNT_ID, senderId);
				}

				processInteractiveMessage (senderId, receiverId, buttonId, buttonLabel, senderName)
					.catch (err => formattedErrorLog (err));

				return;  // En este caso no hacemos buffering porque el formato es incompatible con el de mensajes de texto

			default:
				await sendWhatsappMessageRequest (receiverId, senderId, "Lo siento, pero sólo puedo procesar mensajes de texto 😢 ¿Te puedo ayudar con algo más?");
				throw new Error (`Maximum number of retries exceeded without a proper response from voiceflow. Message body for failed requests was: ${messageBody}`);
		}

		formattedLog (`Sender with ID ${senderId} and name '${senderName}' sent: ${JSON.stringify (entryChange.value.messages[0])}`);


		
		if (storedConversation.open) {
			await replyIntercomConversationAsUser (storedConversation.conversationId, storedConversation.userPhoneNumberId, wrapUserMessage (messageBody), messageImageId ? [ `${process.env.META_MEDIA_PATH}/${messageImageId}` ] : null);
		} else {
			let contact = await getIntercomContactByExternalId (senderId);

			if (!contact) contact = await createIntercomContact (senderId, senderName);

			const message = await sendIntercomUserMessage (contact.id, wrapUserMessage (messageBody));
			//await assignConversationToAdmin (message.conversation_id, process.env.INTERCOM_DEFAULT_ADMIN_ID);
			await storeIntercomConversation (message.conversation_id, null, contact.id, process.env.BUSINESS_ACCOUNT_ID, senderId);
		}

		if (handoff) return;

		// Set session expiration
		setGlobalTimeout (generateTimeoutKey (senderId), setTimeout (() => {
			try {
				sendVoiceflowInteractEventRequest (senderId, process.env.CLOSE_CHAT_MESSAGE)
					.then (res => {
						res.data.forEach (data => {
							if (data.type === "text") {
								setTimeout (() => {
									sendWhatsappMessageRequest (receiverId, senderId, cleanVoiceflowMessageForWhatsapp (data.payload.message))
										.catch (err => formattedErrorLog (err));
								}, data.payload.delay);
							}
						});

						putVoiceflowTranscriptRequest (senderId)
							.then (res => formattedLog (`Put transcript data to session ${senderId}`))
							.catch (err => formattedErrorLog (err));
					})
					.catch (err => formattedErrorLog (err));
				deleteVoiceflowStateRequest (senderId)
					.then (res => {
						formattedLog (`Deleted session for user ${senderId} for inactivity`);
						clearGlobalTimeout (generateTimeoutKey (senderId));
					})
					.catch (err => formattedErrorLog (err));
			} catch (err) {
				formattedErrorLog (err);
			}
		}, sessionEndTimeout));

		const bufferKey = generateBufferKey (senderId);
		appendGlobalBuffer (bufferKey, messageBody);
		setGlobalTimeout (bufferKey, setTimeout (async () => {
			try {
				const messageBuffer = getGlobalBuffer (bufferKey);
				//console.log (`message being sent from ${senderId}: ${messageBuffer}`);
				clearGlobalBuffer (bufferKey);
				clearGlobalTimeout (bufferKey);
				processTextMessage (senderId, receiverId, messageBuffer, senderName);
			} catch (err) {
				formattedErrorLog (err);
			}
		}, bufferFlushTimeout));
	} catch (err) {
		formattedErrorLog (err);
	}
}

async function processInteractiveMessage (senderId, receiverId, buttonId, buttonLabel, senderName) {
	const vfResponse = await sendVoiceflowInteractChoiceRequest (senderId, buttonId, buttonLabel);

	await processMessage (vfResponse, senderId, receiverId, undefined, senderName);
}

async function processTextMessage (senderId, receiverId, messageBody, senderName) {
	const vfResponse = await sendVoiceflowInteractRequest (senderId, messageBody);

	await processMessage (vfResponse, senderId, receiverId, messageBody, senderName);
}

async function processMessage (vfResponse, senderId, receiverId, messageBody, senderName) {
	try {
		const storedConversation = await getStoredIntercomConversation (senderId);

		let retries = 0;
		while (vfResponse.data.length === 0 && retries < maxRetries) {
			vfResponse = await sendVoiceflowInteractRequest (senderId, messageBody);
			retries++;
		}

		if (vfResponse.data.length === 0) {
			await sendWhatsappMessageRequest (receiverId, senderId, "Lo siento, pero sólo puedo procesar mensajes de texto 😢 ¿Te puedo ayudar con algo más?");
			putVoiceflowTranscriptRequest (senderId)
				.then (res => formattedLog (`Put transcript data to session ${senderId}`))
				.catch (err => formattedErrorLog (err));
			throw new Error (`Maximum number of retries exceeded without a proper response from voiceflow. Message body for failed requests was: ${messageBody}`);
		}

		for (let data of vfResponse.data) {
			if (data.type === "choice") {
				await sendWhatsappInteractiveMessageRequest (receiverId, senderId, choiceToInteractiveButtons (data));
				await replyIntercomConversationAsUser (storedConversation.conversationId, senderId, wrapAdminMessage (replyOptionsToMessage (data.payload.buttons.map ((option, idx) => ({ text: option.name, uuid: idx })))));
				continue;
			}

			if (data.type === "text") {
				await sendWhatsappMessageRequest (receiverId, senderId, cleanVoiceflowMessageForWhatsapp (data.payload.message));
				await replyIntercomConversationAsUser (storedConversation.conversationId, senderId, wrapAdminMessage (data.payload.message));
				continue;
			}

			if (data.type === "visual" && data.payload.visualType === "image") {
				await sendWhatsappMediaRequestByUrl (receiverId, senderId, data.payload.image, "");
				await replyIntercomConversationAsUser (storedConversation.conversationId, senderId, wrapAdminMessage (""), data.payload.image ? [ data.payload.image ] : null);
				continue;
			}

			if (data.type === "trace") {
				if (data.payload.name === "talk_to_agent") {
					/*const dialogState = (await getVoiceflowStateByUserId (senderId)).data;
					let contact = await getIntercomContactByExternalId (senderId);

					if (!contact) contact = await createIntercomContact (senderId, senderName);

					const message = await sendIntercomUserMessage (contact.id, generateHandoffMessage (dialogState.variables._memory_, messageBody));
					await assignConversationToAdmin (message.conversation_id, process.env.INTERCOM_DEFAULT_ADMIN_ID);*/
					await assignConversationToAdmin (storedConversation.conversationId, process.env.INTERCOM_DEFAULT_ADMIN_ID);
					continue;
				}
			}

			if (data.type === "end") {
				clearGlobalTimeout (generateTimeoutKey (senderId));
				continue;
			}

			if (!data.type) {
				throw new Error ("Message type is undefined or null");
			}

			/*if (data.type === "no-reply") {
				setTimeout (() => {
					sendWhatsappMessageRequest (receiverId, senderId, cleanVoiceflowMessageForWhatsapp (data.payload.message))
						.catch (err => formattedErrorLog (err));
				}, data.payload.timeout * 1000);
			}*/
		}

		putVoiceflowTranscriptRequest (senderId)
			.then (res => formattedLog (`Put transcript data to session ${senderId}`))
			.catch (err => formattedErrorLog (err));
	} catch (err) {
		formattedErrorLog (err);
	}
}

function wrapUserMessage (messageBody) {
	return `<b>user:<b> ${messageBody}`;
}

function wrapAdminMessage (messageBody) {
	return `<b>admin:<b> ${messageBody}`;
}

function replyOptionsToMessage (replyOptions) {
	let message = "<br>";

	replyOptions.forEach (replyOption => {
		message += `<b>Opción ${parseInt (replyOption.uuid) + 1}:<b> ${replyOption.text}<br>`;
	});

	return message;
}