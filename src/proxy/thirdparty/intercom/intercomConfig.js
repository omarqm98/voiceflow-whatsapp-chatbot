const { default: axios } = require("axios");
const dayjs = require("dayjs");
const { IntercomClient } = require ("intercom-client");
const { formattedErrorLog } = require("../../../utils/loggingUtils");

const intercomClient = new IntercomClient ({ token: process.env.INTERCOM_ACCESS_TOKEN });

let validIPs = [];

function fetchValidIPs () {
	axios.get (process.env.INTERCOM_VALID_US_IPS_URL)
	.then (res => res.data.ip_ranges.forEach (ip => {
		validIPs.push (ip.range.split ("/")[0]);
	}))
	.catch (err => formattedErrorLog (err));
}


fetchValidIPs ();
setInterval (() => {
	if (dayjs ().hour () - (dayjs ().utcOffset () / 60)  === 8 && dayjs ().minute () <= 5) {
		fetchValidIPs ();
	}
}, 10000)

exports.getValidIntercomIPs = function () {
	return validIPs;
}

exports.intercomClient = intercomClient;