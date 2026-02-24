const WebsocketMessage = require("./WsMessage");

class WebsocketUserMessage extends WebsocketMessage{
	constructor (messageData) {
		super ({ direction: "user" });
		this.contactId			= messageData.contactId || null;
		this.businessContactId	= messageData.businessContactId || null;
		this.type				= messageData.type || null;
		this.body				= messageData.body || null;
	}

	toJson () {
		return {
			...super.toJson (),
			contactId: this.contactId,
			businessContactId: this.businessContactId,
			type: this.type,
			body: this.body
		};
	}

	toJsonString () {
		return JSON.stringify (this.toJson ());
	}
}

module.exports = WebsocketUserMessage;