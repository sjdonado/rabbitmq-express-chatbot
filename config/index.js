const config = {
  port: process.env.PORT || 3000,
  rabbitmq: {
    uri: process.env.RABBITMQ_URI,
    clientUri: process.env.RABBITMQ_CLIENT_WS,
    queueName: 'mqtt-chatbot',
  },
};

module.exports = config;
