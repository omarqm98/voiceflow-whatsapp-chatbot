const axios = require ("axios");

exports.createAirtableRecord = async function (tableId, recordData) {
	const url = `${process.env.AT_API_URL}/${process.env.AT_BASE_ID}/${tableId}`;
	const method = "POST";
	
	return axios ({
		url: url,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.AT_ACCESS_TOKEN}`
		},
		data: {
			fields: recordData,
		}
	});
};

exports.getAirtableRecordsByTableId = async function (tableId, filterFormula = null) {
	const url = `${process.env.AT_API_URL}/${process.env.AT_BASE_ID}/${tableId}`;
	const method = "GET";
	const params = {};

	if (filterFormula) params.filterFormula = filterFormula;

	return axios ({
		url: url,
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.AT_ACCESS_TOKEN}`
		},
		params: params
	});
};