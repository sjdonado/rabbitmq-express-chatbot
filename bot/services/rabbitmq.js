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
    console.log('[amqp]::connected');
    return Promise.all([
      ch.assertQueue(rabbitmq.defaultQueue, assertQueueOptions),
      ch.assertQueue(rabbitmq.availableQueues, assertQueueOptions),
    ]);
  })
  .catch((err) => {
    console.log(err.message);
    setTimeout(() => {
      attempts += 1;
      console.log(`[amqp]::reconnecting: attempts ${attempts}/5`);
      connect();
    }, 3500);
  });

/**
 * Publish message to rabbitmq queue
 * @param {String} queueName
 * @param {String} msg
 */
const publishToQueue = async (queueName, msg) => {
  try {
    if (ch) {
      ch.sendToQueue(queueName, Buffer.from(msg));
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * Consume the rabbitmq queue
 * @param {String} queueName
 * @param {Function} callback
 * @returns {Object} { message: String, username: String }
 */
const consumeQueue = async (queueName, callback) => {
  try {
    ch.consume(queueName, (msg) => {
      const message = msg.content.toString();
      console.log(`[amqp]::message: ${message}`);
      callback(message);
    }, { noAck: true });
  } catch (err) {
    callback(err);
  }
};

process.on('exit', () => {
  ch.close();
  console.log('Closing rabbitmq channel');
});

module.exports = {
  connect,
  publishToQueue,
  consumeQueue,
};
