const amqp = require('amqplib');

const { rabbitmq } = require('../config');

let attempts = 0;
let ch = null;

/**
 * Connect to rabbitmq
 */
const connect = () => amqp.connect(rabbitmq.URI)
  .then((conn) => conn.createChannel())
  .then((channel) => {
    ch = channel;
    return ch.assertQueue(rabbitmq.queueName, {
      durable: false,
    });
  })
  .then(() => console.log('[amqp]::connected'))
  .catch((err) => {
    console.log(err.message);
    setTimeout(() => {
      attempts += 1;
      console.log(`[amqp]::reconnecting: attempts ${attempts}/5`);
      connect();
    }, 3000);
  });

/**
 * Publish message to rabbitmq queue
 * @param {String} msg
 */
const publishToQueue = async (msg) => {
  if (ch) {
    ch.sendToQueue(rabbitmq.queueName, Buffer.from(msg));
  }
};

/**
 * Consume the rabbitmq queue
 * @param {Function} callback
 */
const consumeQueue = async (callback) => ch.consume(rabbitmq.queueName, (msg) => {
  const parsedMessage = msg.content.toString();
  console.log(`[amqp]::message: ${parsedMessage}`);
  callback(parsedMessage);
}, { noAck: true });

process.on('exit', () => {
  ch.close();
  console.log('Closing rabbitmq channel');
});

module.exports = {
  connect,
  publishToQueue,
  consumeQueue,
};
