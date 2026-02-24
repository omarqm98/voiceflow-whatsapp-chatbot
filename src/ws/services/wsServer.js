const { formattedLog, formattedErrorLog } = require ("../../utils/loggingUtils");
const { generateConnectionKeyFromUrl } = require ("./wsConn");

exports.handleWssConnection = function (ws, req) {
	const connectionKey = generateConnectionKeyFromUrl (req.url);

	ws.on ("message", (data, isBinary) => handleWsMessage (ws, data, isBinary));
	ws.on ("close", (code, reason) => formattedLog (`Connection from ${connectionKey} closed, code: '${code}', reason: '${reason}'`));

	formattedLog (`Connection established with host ${req.headers.host}`);
};

exports.handleCloseWssServer = function () {
	formattedLog ("Websocket Server closed")
};

exports.handleWssError = function (err) {
	formattedErrorLog (err);
};