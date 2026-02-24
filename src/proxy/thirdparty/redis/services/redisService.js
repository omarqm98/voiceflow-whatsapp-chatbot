const { standardRedisClient } = require("../redisConfig");

exports.setRedisHash = function (key, ...fields) {
	return standardRedisClient.hSet (key, fields);
};

exports.getRedisHashAll = function (key) {
	return standardRedisClient.hGetAll (key);
};

exports.deleteRedisKey = function (key) {
	return standardRedisClient.del (key);
};