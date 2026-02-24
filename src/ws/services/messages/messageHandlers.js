const WebsocketUserMessage = require("../../models/WsUserMessage");
const { getConnectionsByKey } = require("../wsConn");

/* User messages come from Meta, through out message proxy.
   We need to parse them as Meta webhook events and forward them to:
   
   - Voiceflow
   - Intercom
  
   Each with their respective formats.

   messageData should already be JSON-parsed
*/
exports.handleWsUserMessage = async function (messageData) {
	const wsUserMessage = new WebsocketUserMessage (messageData);

	const voiceflowConnections = getConnectionsByKey (generateVoiceflowKeyFromContactId ());
	const intercomConnections = getConnectionsByKey (generateIntercomKeyFromContactId ());

	intercomConnections.forEach (ws => {
		ws.send (wsUserMessage.toWsIntercomMessage ().toJsonString ());
	});
};

/* Intercom messages come from Intercom, and should be parsed
   as Intercom webhook events and forward them to:
   
   - Voiceflow
   - Proxy

   Each with their respective formats.

   messageData should already be JSON-parsed
*/
exports.handleWsIntercomMessage = async function (messageData) {
	
};