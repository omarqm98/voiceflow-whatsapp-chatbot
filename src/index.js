require ("dotenv").config ();
const express = require ("express");
const webhookRouter = require("./proxy/resources/webhooks/webhookResource");
const { formattedLog } = require("./utils/loggingUtils");
const { initRedis } = require("./proxy/thirdparty/redis/redisConfig");
const metaMediaRouter = require("./proxy/resources/media/metaMediaResource");
//const { initWss } = require("./ws/wsInit");

const app = express ();

function rawBodySaver(req, res, buf, encoding) {
	if (buf && buf.length) {
		req.rawBody = buf.toString(encoding || 'utf8');
	}
}

app.use (express.json ({ verify: rawBodySaver }));

app.use ("/webhooks", webhookRouter);
app.use ("/media/meta", metaMediaRouter);

const port = process.env.PORT || 8090;
app.listen (port, async () => {
	//initWss ();
	await initRedis ();
	formattedLog (`App listening on port ${port}`);
});
