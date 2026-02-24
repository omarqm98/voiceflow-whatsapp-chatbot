const globalTimeouts = {};

exports.generateTimeoutKey = function (id) {
	return `${id}-end-session`;
}

exports.getGlobalTimeout = function (key) {
	return globalTimeouts[key];
}

exports.setGlobalTimeout = function (key, timeoutId) {
	if (globalTimeouts[key]) {
		exports.clearGlobalTimeout (key);
	}

	globalTimeouts[key] = timeoutId;
};

exports.clearGlobalTimeout = function (key) {
	clearTimeout (globalTimeouts[key]);
	delete globalTimeouts[key];
};