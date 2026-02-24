const { default: axios } = require ("axios");
const { formattedLog } = require("../../../utils/loggingUtils");

exports.sendWhatsappMessageRequest = async function (accountId, receiverId, content) {
	const path = `${process.env.META_GRAPH_API_URL}/${accountId}/messages`;
	const method = "POST";

	formattedLog (`Sending whatsapp message from account ${accountId} to receiver ${receiverId}`);

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`
		},
		data: {
			messaging_product: "whatsapp",
			to: receiverId,
			text: {
				body: content,
				preview_url: false
			},
			type: "text"
		}
	});
};

exports.sendWhatsappInteractiveMessageRequest = async function (accountId, receiverId, interactiveButtons, body = "Elegir una opción") {
	const path = `${process.env.META_GRAPH_API_URL}/${accountId}/messages`;
	const method = "POST";

	formattedLog (`Sending whatsapp interactive message from account ${accountId} to receiver ${receiverId}`);

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`
		},
		data: {
			messaging_product: "whatsapp",
			to: receiverId,
			type: "interactive",
			interactive: {
				body: {
					text: body
				},
				type: "button",
				action: {
					buttons: interactiveButtons
				}
			}
		}
	});
}

exports.sendWhatsappMediaRequestByUrl = async function (accountId, receiverId, imageUrl, imageCaption) {
	const path = `${process.env.META_GRAPH_API_URL}/${accountId}/media`;
	const method = "POST";

	formattedLog (`Uploading whatsapp media from account ${accountId}`);

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`
		},
		data: {
			messaging_product: "whatsapp",
			to: receiverId,
			type: "image",
			image: {
				link: imageUrl,
				caption: imageCaption
			}
		}
	});
}

exports.getWhatsappMediaRequest = async function (mediaId) {
	const path = `${process.env.META_GRAPH_API_URL}/${mediaId}`;
	const method = "GET";

	formattedLog (`Getting whatsapp media with ID ${mediaId}`);

	return axios ({
		url: path,
		method: method,
		headers: {
			"Authorization": `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`
		}
	});
}