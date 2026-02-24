const { default: axios } = require("axios");
const { formattedErrorLog } = require("../../../../utils/loggingUtils");
const { intercomClient } = require("../intercomConfig");
const { parsePhoneNumber } = require("libphonenumber-js/min");

exports.createIntercomContact = async function (senderId, senderName) {
	return intercomClient.contacts.create ({
		external_id: senderId,
		role: "user",
		phone: `+${senderId}`,
		name: senderName
	});
};

exports.getIntercomContactByExternalId = async function (externalId) {
	try {
		const requestConfig = {
			url: `${process.env.INTERCOM_API_URL}/contacts/find_by_external_id/${externalId}`,
			method: "GET",
			headers: {
				"Authorization": `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`
			}
		};

		const res = await axios (requestConfig);
		return res.data;
	} catch (err) {
		if (err.statusCode === 404 || err.status === 404) return null
		throw err;
	}
}