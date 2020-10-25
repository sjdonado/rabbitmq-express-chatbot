const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketIO(server);

const { port } = require('./config');

const {
  connect,
  publishToQueue,
  newAvailableQueue,
} = require('./services/rabbitmq');

connect()
  .then(() => {
    io.on('connection', async (socket) => {
      socket.on('join', async (queueName) => {
        socket.leaveAll();
        socket.join(queueName);
        await newAvailableQueue(socket, queueName);
      });
      socket.on('message', ({ queueName, message, username }) => {
        publishToQueue(queueName, JSON.stringify({ message, username }));
      });
    });
  });

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
