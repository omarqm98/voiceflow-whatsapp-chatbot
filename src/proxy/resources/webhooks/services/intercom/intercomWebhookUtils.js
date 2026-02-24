const cheerio = require ("cheerio");

exports.getIntercomReplyAttachments = function (event) {
	console.log (event.data.item.conversation_parts.conversation_parts[0].body);
};

exports.getIntercomReplyImageUrls = function (event) {
	const $ = cheerio.load (event.data.item.conversation_parts.conversation_parts[0].body);

	const imageUrls = $.extract ({
		urls: {
			selector: [ "img" ],
			value: "src"
		}
	})

	console.log (imageUrls);

	if (imageUrls.urls === null || imageUrls.urls === undefined || !imageUrls) return null;

	return imageUrls.urls instanceof Array ?
		imageUrls.urls :
		[ imageUrls.urls ];
};

exports.getIntercomReplyText = function (event) {
	const $ = cheerio.load (event.data.item.conversation_parts.conversation_parts[0].body);

	return $.extract ({text: [ "p" ]}).text;
};

exports.generateHandoffMessage = function (memory, lastMessage) {
	if (!(memory instanceof Array)) throw new Error ("Expected 'memory' to be an array");

	const filteredMessages = memory.filter (turn => turn.content !== undefined);
	const truncatedMessages = filteredMessages.slice (-5);

	console.log (filteredMessages);

	let handoffMessage = "";

	truncatedMessages.forEach ((message, idx) => {
		if (idx > 0) handoffMessage += "\n\n";
		handoffMessage += `<b>${message.role}:</b> ${message.content}`;
	});

	return handoffMessage;
}