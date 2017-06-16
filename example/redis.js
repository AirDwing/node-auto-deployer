const redis = require('@dwing/redis');

const { redisOptions } = require('./config');

const client = redis(redisOptions);

module.exports = client.select(0);
