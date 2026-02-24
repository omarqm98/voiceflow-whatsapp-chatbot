const { formattedWarnLog } = require("../../../utils/loggingUtils");

class WebSocketConnection {
	constructor (url) {
		this.ws			= null;
		this.baseUrl	= url;
	}

	connect () {
		this.ws = new WebSocket (this.baseUrl);
	}

	addCloseListener (callback) {
		if (!this.ws) {
			formattedWarnLog ("Websocket is not initialized");
		}

		this.ws.onclose (callback);
	}

	addMessageListener (callback) {
		if (!this.ws) {
			formattedWarnLog ("Websocket is not initialized");
		}

		this.ws.onmessage (callback);
	}

	send (data) {
		if (!this.isConnected ()) formattedWarnLog ("Attempting to send a message to a non-open connection");

		this.ws.send (data);
	}

	isConnected () {
		if (!this.ws) return false;
		return this.ws.readyState === WebSocket.OPEN;
	}
}