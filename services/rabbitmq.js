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
        res(channel);
      }
    })
    .catch((err) => {
      if (attempts < 5) {
        setTimeout(() => {
          attempts += 1;
          console.log(`[amqp]::reconnecting: attempts ${attempts}/5`, err.message);
          res(connect());
        }, 4000);
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
const consumeQueue = (ch, queueName, callback) => {
  try {
    ch.consume(queueName, (msg) => {
      console.log('[amqp]::message:', msg.content.toString());
      const { message, username } = JSON.parse(msg.content.toString());
      callback(false, { message, username });
    }, { noAck: true });
  } catch (err) {
    callback(err);
  }
};

const queues = new Set();
/**
 * Check if queue exists and consume it
 * @param {Object} channel
 * @param {SocketIO} socket
 * @param {String} queueName
 * @param {Function} callback {{ username: String, message: String }}
 */
const createAndConsumeQueue = (ch, queueName, callback) => {
  if (!queues.has(queueName)) {
    queues.add(queueName);
    ch.assertQueue(queueName, assertQueueOptions)
      .then(() => {
        consumeQueue(ch, queueName, (err, { message, username }) => {
          if (err) {
            callback(err);
          } else {
            if (message[0] === '/') {
              publishToQueue(ch, rabbitmq.botQueue, JSON.stringify({
                queueName,
                username,
                message,
              }));
            }
            callback(false, { username, message });
          }
        });
      })
      .catch((err) => {
        console.log(err);
        callback(err);
      });
  } else {
    callback(true);
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
  createAndConsumeQueue,
};
