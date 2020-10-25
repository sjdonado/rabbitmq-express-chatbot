const amqp = require('amqplib/callback_api');

const { rabbitmq } = require('../../config');

let ch = null;
amqp.connect(rabbitmq.uri, (err, conn) => {
  conn.createChannel((err, channel) => {
    ch = channel;
    console.log('[amqp]::connected');
  });
});

const publishToQueue = async (msg) => {
  ch.sendToQueue(rabbitmq.queueName, Buffer.from(msg));
};

const consumeQueue = async () => {
  amqp.connect(rabbitmq.uri, (err, conn) => {
    conn.createChannel((err, ch) => {
      ch.consume(rabbitmq.queueName, (msg) => {
        console.log(`[amqp]::message: ${msg.content.toString()}`);
      }, { noAck: true });
    });
  });
};

process.on('exit', () => {
  ch.close();
  console.log('Closing rabbitmq channel');
});

module.exports = {
  publishToQueue,
  consumeQueue,
};
