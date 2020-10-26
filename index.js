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
  .then((ch) => {
    console.log('[amqp]::connected');
    io.on('connection', (socket) => {
      socket.on('join', (queueName) => {
        socket.leaveAll();
        socket.join(queueName);
        newAvailableQueue(ch, queueName, (newMessage) => {
          console.log('[socketio]::emit:', queueName, newMessage);
          socket.to(queueName).emit('message', newMessage);
        });
      });
      socket.on('message', ({ queueName, message, username }) => {
        publishToQueue(ch, queueName, JSON.stringify({ message, username }));
      });
    });
  });

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
