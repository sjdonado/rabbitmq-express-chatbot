const config = {
  port: process.env.PORT || 3000,
  secret: process.env.SECRET,
  rabbitmq: {
    URI: process.env.RABBITMQ_URI,
    clientUri: process.env.RABBITMQ_CLIENT_WS,
    queueName: 'mqtt-chatbot',
  },
  redisURI: process.env.REDIS_URI,
};

module.exports = config;
