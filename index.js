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

const queues = new Set();
const validateAndConsumeQueue = (socket, queueName) => {
  if (!queues.has(queueName)) {
    queues.add(queueName);
    consumeQueue(queueName, (newMessage) => socket.to(queueName).emit('message', newMessage));
  }
};

connect()
  .then(() => {
    io.on('connection', async (socket) => {
      socket.on('join', (queueName) => {
        socket.leaveAll();
        socket.join(queueName);
        validateAndConsumeQueue(socket, queueName);
      });
      socket.on('message', ({ queueName, message, username }) => {
        publishToQueue(queueName, JSON.stringify({ message, username }));
      });
    });
  });

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
