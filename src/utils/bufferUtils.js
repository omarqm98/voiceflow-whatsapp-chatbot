const { isPunctuated } = require("./stringUtils");

/*
	Como opción más escalable debería usarse un servicio de key-value
	descentralizado, como Redis. Como versión inicial es aceptable, pero
	podría requerir un cambio.
*/
const globalBuffers = {};

exports.generateBufferKey = function (id) {
	return `${id}-buffer-flush`;
}

exports.appendGlobalBuffer = function (key, content) {
	let bufferContent;
	
	if (globalBuffers[key]) {
		bufferContent = globalBuffers[key];

		if (!isPunctuated (bufferContent)) {
			bufferContent += ".";
		}

		bufferContent += ` ${content}`;
	} else {
		bufferContent = content;
	}

	globalBuffers[key] = bufferContent;
}

exports.getGlobalBuffer = function (key) {
	return globalBuffers[key];
}

exports.clearGlobalBuffer = function (key) {
	delete globalBuffers[key];
};