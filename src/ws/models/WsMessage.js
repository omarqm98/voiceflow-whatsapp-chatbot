const { isEmptyString } = require("../../utils/stringUtils");

class WebsocketMessage {
	constructor (messageData) {
		this.direction	= messageData.direction || "unknown";
		this.metadata		= messageData.metadata || {};

		if (isEmptyString (this.direction)) {
			throw new Error ("Direction is empty");
		}
	}

	toJson () {
		return {
			direction: this.direction,
			metadata: this.metadata
		}
	}
}

module.exports = WebsocketMessage;