const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = socketIO(server);

const { port } = require('./config');

const {
  connect,
  publishToQueue,
  createAndConsumeQueue,
} = require('./services/rabbitmq');

connect()
  .then((ch) => {
    console.log('[amqp]::connected');
    io.on('connection', (socket) => {
      socket.on('join', (queueName) => {
        socket.leaveAll();
        socket.join(queueName);
        socket.emit('joined');
        createAndConsumeQueue(ch, queueName, (err, newMessage) => {
          if (!err) {
            console.log('[socketio]::emit:', queueName, newMessage);
            io.to(queueName).emit('message', newMessage);
          }
        });
      });
      socket.on('message', ({ queueName, message, username }) => {
        publishToQueue(ch, queueName, JSON.stringify({ message, username }));
      });
    });
  }).catch((err) => {
    console.log(err);
  });

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
