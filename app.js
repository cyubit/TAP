const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const port = 3000
const io = new Server(server, {pingInterval: 1000, pingTimeout: 3000});

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players = {}
const clientRooms = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  players[socket.id] = {
    clicks: 0,
    name: '',
    type: ''
  }
  io.emit('reset', socket.id)

  // io.emit('update', players)
  console.log(players)

  socket.on('updateScore', (count) => {
    players[socket.id].clicks = count
    console.log(players)
    // io.emit('update', players)
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete players[socket.id]
    console.log('user disconnected');
  })

  socket.on('host', (hostName) => {
    console.log(hostName)
    players[socket.id].name = hostName
    players[socket.id].type = 'host'

    roomCode = Math.floor(Math.random() * 1000)
    clientRooms[socket.id] = roomCode
    socket.emit('displayGameCode', roomCode)

    socket.join(roomCode)
    io.emit('playerTable', players)

  })

  socket.on('join', (playerName, inputtedCode) => {
    console.log(playerName)
    console.log(inputtedCode)
    players[socket.id].name = playerName
    players[socket.id].type = 'player'

    const room = io.sockets.adapter.rooms[inputtedCode]
    let allUsers;
    if (room) {
      allUsers = room.sockets
    }
    console.log(allUsers)
    clientRooms[socket.id] = inputtedCode
    socket.join(inputtedCode)
    io.emit('playerTable', players)
    // console.log(room)
    // console.log(clientRooms)
  })

});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});