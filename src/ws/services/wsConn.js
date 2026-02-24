const { formattedWarnLog, formattedErrorLog } = require("../../utils/loggingUtils");
const WebsocketMessage = require("../models/WsMessage");
const { messageDirections } = require("../models/constants/wsMessageConstants");

let connections = {};

exports.generateConnectionKeyFromUrl = function (url) {
	return url.split ("/").at(-1);
};

exports.addConnection = function (key, ws) {
	if (connections[key]) connections[key].push (ws);
	else connections[key] = [ ws ];
};

exports.getConnections = function () {
	return connections;
};

exports.getConnectionsByKey = function (key) {
	return connections[key];
;}

function clearClosedConnections () {
	Object.entries (connections).forEach (([ key, connections ]) => {
		if (connections) {
			connections.forEach ((ws, idx) => {
				if (ws.readyState === WebSocket.CLOSED) {
					connections.splice (idx, 1);
				}
			});
		}
	});
}

exports.handleWsMessage = function (ws, data, isBinary) {
	try {
		if (isBinary) throw new Error ("Binary data not processable");

		const wsMessage = new WebsocketMessage (JSON.parse (data));

		switch (wsMessage.direction) {
			case messageDirections.USER:
				return handleWsUserMessage (wsMessage.data);

			case messageDirections.INTERCOM:
				return handleWsIntercomMessage (wsMessage.data);

			case messageDirections.VOICEFLOW:
				return;

			default:
				formattedWarnLog (`Message with unknown direction ${wsMessage.direction} ignored`);
				return;
		}
	} catch (err) {
		formattedErrorLog (err);
	}
};

setInterval (() => clearClosedConnections (), 60 * 1000);