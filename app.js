const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const port = 3000
const io = new Server(server);

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  players[socket.id] = {
    clicks: 0,
    name: ''
  }

  io.emit('update', players)
  console.log(players)

  socket.on('disconnect', () => {
    delete players[socket.id]
    console.log('user disconnected');
  })
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

