const { connect, consumeQueue } = require('./services/rabbitmq');

const { rabbitmq } = require('./config');

connect()
  .then(() => {
    consumeQueue(rabbitmq.botQueue, (newMessage) => {
      console.log(newMessage);
    });
  });
