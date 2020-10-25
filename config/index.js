const config = {
  rabbitmq: {
    uri: process.env.RABBITMQ_URI,
    queueName: 'chatbot',
  },
};

module.exports = config;
