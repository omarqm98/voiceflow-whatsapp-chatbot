const express = require ("express");
const { requestLog } = require("../../middleware/requestLogging");
const { getWhatsappMediaRequest } = require("../../thirdparty/whatsapp/whatsappRequest");
const { default: axios } = require("axios");
const { formattedErrorLog } = require("../../../utils/loggingUtils");

const metaMediaRouter = express.Router ();

metaMediaRouter.use (requestLog ());

metaMediaRouter.get ("/:mediaId", async (req, res) => {
	try {
	const mediaId = req.params.mediaId;

	const imageUrl = (await getWhatsappMediaRequest (mediaId)).data.url;

	const imageRes = await axios.get (imageUrl, {
		responseType: "stream",
		headers: {
			"Authorization": `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`
		}
	});

	res.setHeader ("Content-Type", imageRes.headers["content-type"]);
	imageRes.data.pipe (res);
	} catch (err) {
		formattedErrorLog (err);
		res.sendStatus (500);
	}
});

module.exports = metaMediaRouter;