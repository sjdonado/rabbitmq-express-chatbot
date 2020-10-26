const http = require('http');
const socketIO = require('socket.io');
const sharedsession = require('express-socket.io-session');
const { app, session } = require('./app');

const { port } = require('./config');

const {
  connect,
  publishToQueue,
  createAndConsumeQueue,
} = require('./services/rabbitmq');


const server = http.createServer(app);
const io = socketIO(server);

io.use(sharedsession(session, {
  autoSave: true,
}));

connect()
  .then((ch) => {
    console.log('[amqp]::connected');
    io.on('connection', (socket) => {
      const { username } =  socket.handshake.session;
      if (username) {
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
        socket.on('message', ({ queueName, message }) => {
          publishToQueue(ch, queueName, JSON.stringify({
            message,
            username,
          }));
        });
      }
    });
  }).catch((err) => {
    console.log(err);
  });

server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
