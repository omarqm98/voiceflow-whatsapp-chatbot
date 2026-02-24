const { createClient } = require ("redis");
const { formattedErrorLog, formattedLog } = require ("../../../utils/loggingUtils");

const standardRedisClient = createClient ({
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT
	}
});

standardRedisClient.on ("error", err => formattedErrorLog (err));

exports.initRedis = async function () {
	await standardRedisClient.connect ();

	formattedLog ("Redis connection successful");
};

exports.standardRedisClient = standardRedisClient;