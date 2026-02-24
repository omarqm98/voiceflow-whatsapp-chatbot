const { default: axios } = require("axios");
const { formattedLog } = require("../../../utils/loggingUtils");

exports.sendVoiceflowInteractRequest = async function (userId, content) {
	const path = `${process.env.VF_RUNTIME_API_URL}/state/user/${userId}/interact`;
	const method = "POST";

	formattedLog (`Sending interact request to VoiceFlow API for user ${userId}`);

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`,
			"versionID": "production"
		},
		data: {
			action: {
				type: "text",
				payload: content
			}
		},
		/*params: {
			verbose: true
		}*/
	});
};

exports.sendVoiceflowInteractChoiceRequest = async function (userId, buttonId, buttonLabel) {
	const path = `${process.env.VF_RUNTIME_API_URL}/state/user/${userId}/interact`;
	const method = "POST";

	formattedLog (`Sending interact choice request to VoiceFlow API for user ${userId}`);

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`,
			"versionID": "production"
		},
		data: {
			action: {
				type: buttonId,
				payload: {
					label: buttonLabel
				}
			}
		},
		/*params: {
			verbose: true
		}*/
	});
}

exports.sendVoiceflowInteractEventRequest = async function (userId, eventName) {
	const path = `${process.env.VF_RUNTIME_API_URL}/state/user/${userId}/interact`;
	const method = "POST";

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`,
			"versionID": "production"
		},
		data: {
			action: {
				type: "event",
				payload: {
					event: {
						name: eventName
					}
				}
			}
		},
		/*params: {
			verbose: true
		}*/
	});
};

exports.deleteVoiceflowStateRequest = async function (userId) {
	const path = `${process.env.VF_RUNTIME_API_URL}/state/user/${userId}`;
	const method = "DELETE";

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`
		}
	});
}

exports.putVoiceflowTranscriptRequest = async function (userId) {
	const path = `${process.env.VF_API_URL}/transcripts`;
	const method = "PUT";

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`
		},
		data: {
			projectID: `${process.env.VF_PROJECT_ID}`,
			sessionID: `${userId}`
		}
	});
}

exports.getVoiceflowStateByUserId = async function (userId) {
	const path = `${process.env.VF_RUNTIME_API_URL}/state/user/${userId}`;
	const method = "GET";

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`,
			"Cache-Control": "no-cache, no-store, must-revalidate"
		}
	});
};

exports.patchVoiceflowStateByUserId = async function (userId, fieldsToPatch) {
	const path = `${process.env.VF_RUNTIME_API_URL}/state/user/${userId}/variables`;
	const method = "PATCH";

	return axios ({
		url: path,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `${process.env.VF_API_KEY}`
		},
		data: fieldsToPatch
	});
};

exports.getVoiceflowTranscriptShort = async function () {

};