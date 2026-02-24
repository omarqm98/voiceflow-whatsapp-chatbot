const { AxiosError } = require("axios");
const dayjs = require("dayjs");
const fs = require ("fs");

exports.writeLogToFile = function (message) {
	fs.appendFile (process.env.LOGS_OUTPUT_FILE, message, err => {
		if (err) {
			console.error (err);
		}
	});
}

exports.formattedLog = function (message) {
	const log = `[${dayjs ().format ("DD-MM-YYYY HH:mm:ss Z")}]\tINFO\t${message}\n`;
	console.info (log);

	exports.writeLogToFile (log);
}

exports.formattedErrorLog = function (error) {
	if (error instanceof AxiosError) {
		error.message += `\n${JSON.stringify (error.response.data)}`;
	}

	const message = error.message;
	const logMessage = `[${dayjs ().format ("DD-MM-YYYY HH:mm:ss Z")}]\tERROR\t${message}\n`;

	console.error (error);
	console.error (error.stack);

	exports.writeLogToFile (logMessage);
	exports.writeLogToFile (error.stack)
}

exports.formattedWarnLog = function (message) {
	const log = `[${dayjs ().format ("DD-MM-YYYY HH:mm:ss Z")}]\tWARN\t${message}\n`;
	console.warn (log);

	exports.writeLogToFile (log);
}