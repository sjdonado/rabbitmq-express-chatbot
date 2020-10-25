const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketIO(server);

const { port } = require('./config');

const {
  connect,
  publishToQueue,
  consumeQueue,
} = require('./services/rabbitmq');

connect()
  .then(() => {
    consumeQueue((newMessage) => {
      io.emit('message', newMessage);
    });
    io.on('connection', async (socket) => {
      socket.on('message', (msg) => {
        publishToQueue(msg);
      });
    });
  });

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
