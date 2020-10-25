const amqp = require('amqplib');

const { rabbitmq } = require('../config');

let attempts = 0;
let ch = null;

const assertQueueOptions = {
  durable: false,
};

/**
 * Connect to rabbitmq
 * @returns {Promise}
 */
const connect = () => amqp.connect(rabbitmq.URI)
  .then((conn) => conn.createChannel())
  .then((channel) => {
    ch = channel;
    return ch.assertQueue(rabbitmq.defaultQueue, assertQueueOptions);
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
 * @param {String} queueName
 * @param {String} msg
 */
const publishToQueue = async (queueName, msg) => {
  if (ch) {
    ch.assertQueue(queueName, assertQueueOptions)
      .then(() => ch.sendToQueue(queueName, Buffer.from(msg)));
  }
};

/**
 * Consume the rabbitmq queue
 * @param {String} queueName
 * @param {Function} callback
 * @returns {Object} { message: String, username: String }
 */
const consumeQueue = async (queueName, callback) => ch.assertQueue(queueName, assertQueueOptions)
  .then(() => ch.consume(queueName, (msg) => {
    const { message, username } = JSON.parse(msg.content.toString());
    console.log(`[amqp]::message: ${message}`);
    callback({ message, username });
  }, { noAck: true }));

process.on('exit', () => {
  ch.close();
  console.log('Closing rabbitmq channel');
});

module.exports = {
  connect,
  publishToQueue,
  consumeQueue,
};
