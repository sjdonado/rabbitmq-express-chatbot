const amqp = require('amqplib');

const { rabbitmq } = require('../config');

let attempts = 0;
let ch = null;

const assertQueueOptions = {
  durable: false,
  // autoDelete: true,
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
      ch.assertQueue(rabbitmq.botQueue, assertQueueOptions),
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
      const { message, username } = JSON.parse(msg.content.toString());
      console.log(`[amqp]::message: ${message}`);
      callback({ message, username });
    }, { noAck: true });
  } catch (err) {
    callback(err);
  }
};

const queues = new Set();
/**
 * Check if queue exists and consume it
 * @param {SocketIO} socket
 * @param {String} queueName
 */
const newAvailableQueue = async (socket, queueName) => {
  try {
    if (!queues.has(queueName)) {
      queues.add(queueName);
      await ch.assertQueue(queueName, assertQueueOptions);
      consumeQueue(queueName, ({ message, username }) => {
        if (message[0] === '/') {
          publishToQueue(rabbitmq.botQueue, JSON.stringify({ queueName, username, message }));
        }
        console.log('[amqp]::emit:socketio:', message);
        socket.to(queueName).emit('message', { message, username });
      });
    }
  } catch (err) {
    console.log(err);
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
  newAvailableQueue,
};
