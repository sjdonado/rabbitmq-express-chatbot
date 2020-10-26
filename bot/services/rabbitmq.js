const amqp = require('amqplib');

const { rabbitmq } = require('../config');

let attempts = 0;
let currentChannel;

const assertQueueOptions = {
  durable: false,
};

/**
 * Connect to rabbitmq
 * @returns {Promise}
 */
const connect = () => new Promise((res, rej) => {
  amqp.connect(rabbitmq.URI)
    .then((conn) => conn.createChannel())
    .then((channel) => {
      currentChannel = channel;
      if (!channel) {
        res(connect());
      } else {
        channel.assertQueue(rabbitmq.botQueue, assertQueueOptions);
        res(channel);
      }
    })
    .catch((err) => {
      console.log(err.message);
      if (attempts < 5) {
        setTimeout(() => {
          attempts += 1;
          console.log(`[amqp]::reconnecting: attempts ${attempts}/5`);
          res(connect());
        }, 3500);
      } else {
        rej(err);
      }
    });
});

/**
 * Publish message to rabbitmq queue
 * @param {Object} channel
 * @param {String} queueName
 * @param {String} msg
 */
const publishToQueue = async (ch, queueName, msg) => {
  try {
    ch.sendToQueue(queueName, Buffer.from(msg));
  } catch (err) {
    console.log(err);
  }
};

/**
 * Consume the rabbitmq queue
 * @param {Object} channel
 * @param {String} queueName
 * @param {Function} callback
 * @returns {Object} { message: String, username: String }
 */
const consumeQueue = async (ch, queueName, callback) => {
  try {
    ch.consume(queueName, (msg) => {
      const { message, username } = JSON.parse(msg.content.toString());
      console.log(`[amqp]::message: ${message}`);
      callback({ message, username });
    }, { noAck: true });
  } catch (err) {
    callback(err);
  }
};

process.on('exit', () => {
  if (currentChannel) {
    currentChannel.close();
    console.log('Closing rabbitmq channel');
  }
});

module.exports = {
  connect,
  publishToQueue,
  consumeQueue,
};
