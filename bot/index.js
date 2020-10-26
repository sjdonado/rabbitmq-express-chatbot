const { connect, consumeQueue, publishToQueue } = require('./services/rabbitmq');
const { fetchStockPice } = require('./services/stooq');

const { rabbitmq } = require('./config');

connect()
  .then((ch) => {
    console.log('[amqp]::connected');
    consumeQueue(ch, rabbitmq.botQueue, async (newMessage) => {
      const { queueName, message } = JSON.parse(newMessage);
      const username = 'bot';

      const match = message.match(/\/(\w+)=?(.*)/);
      if (match && match.length >= 2) {
        console.log('[bot]::command:', match);
        let response;
        switch (match[1]) {
          case 'stock':
            if (match[2]) {
              const stockPrice = await fetchStockPice(match[2]);
              response = `${match[2].toUpperCase()} quote is ${stockPrice} per share`;
            } else {
              response = 'Stock code not found, try again: /stock=stock_code';
            }
            publishToQueue(ch, queueName, JSON.stringify({
              username,
              message: response,
            }));
            break;
          default:
            publishToQueue(ch, queueName, JSON.stringify({
              username,
              message: `Command: /${match[1]} not found, please try again. (ie: /stock)`,
            }));
            break;
        }
      }
    });
  });
