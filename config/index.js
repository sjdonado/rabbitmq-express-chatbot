const config = {
  port: process.env.PORT || 3000,
  secret: process.env.SECRET,
  origin: process.env.ORIGIN,
  rabbitmq: {
    URI: process.env.RABBITMQ_URI,
    clientUri: process.env.RABBITMQ_CLIENT_WS,
    botQueue: process.env.BOT_QUEUE,
    defaultQueue: 'main',
  },
  redisURI: process.env.REDIS_URI,
};

module.exports = config;
