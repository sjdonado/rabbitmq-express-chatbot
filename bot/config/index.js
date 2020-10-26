const config = {
  rabbitmq: {
    URI: process.env.RABBITMQ_URI,
    botQueue: process.env.BOT_QUEUE,
  },
};

module.exports = config;
