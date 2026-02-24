const { WebSocketServer } = require ("ws");
const { formattedErrorLog, formattedLog } = require("../utils/loggingUtils");
const { handleWssConnection, handleCloseWssServer } = require("./services/wsServer");

const wsServerOptions = {
	port: process.env.WS_SERVER_PORT
};

let wss = null;

exports.initWss = function () {
	wss = new WebSocketServer (wsServerOptions);

	wss.on ("listening", () => formattedLog (`Websocket Server listening on port ${process.env.WS_SERVER_PORT}`));
	wss.on ("connection", (ws, req) => handleWssConnection (ws, req));
	wss.on ("close", ws => handleCloseWssServer (ws));
	wss.on ("error", err => formattedErrorLog (err));
	wss.on ("wsClientError", err => formattedErrorLog (err));
};