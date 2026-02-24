exports.isPunctuated = function (str) {
	return str.endsWith (".") || str.endsWith ("?") || str.endsWith ("!");
};

exports.isEmptyString = function (str) {
	return str === null || str === undefined || typeof str !== "string" || (typeof str === "string" && str.trim ().length === 0);
};