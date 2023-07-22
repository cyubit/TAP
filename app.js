const {instrument} = require('@socket.io/admin-ui');

const express = require('express')
const app = express()
const Timer = require("easytimer.js").Timer;

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
  pingInterval: 1000, 
  pingTimeout: 3000, 
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8080", "https://admin.socket.io"],
    credentials: true
  }
});

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const players = {}
const rooms = {}

io.on('connection', (socket) => {
  console.log('a user connected');

  players[socket.id] = {
    clicks: 0,
    name: '',
    type: '',
    room: ''
  }
  io.emit('reset', socket.id)

  // io.emit('update', players)
  console.log(players)

  socket.on('updateScore', (count) => {
    players[socket.id].clicks = count
    console.log(players)
    io.emit('updateScoretable', players)
  })

  socket.on('startGame', () => {
    const timerInstance = new Timer();
    io.emit('startGame', players)
    timerInstance.start({countdown: true, startValues: {seconds: 15}});
    timerInstance.addEventListener('secondsUpdated', function (e) {
      io.emit('timer', timerInstance.getTimeValues().seconds, players)
    });
    timerInstance.addEventListener('targetAchieved', function (e) {
      io.emit('endGame', players)
    });
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete players[socket.id]
    console.log('user disconnected');
  })

  socket.on('host', (hostName) => {
    // console.log(hostName)
    players[socket.id].name = hostName
    players[socket.id].type = 'host'

    roomCode = makeid(3)
    rooms[roomCode] = {
      host: socket.id,
      participants: []
    }
    rooms[roomCode].participants.push(socket.id)

    socket.emit('displayGameCode', roomCode)
    socket.join(roomCode)
  })

  socket.on('join', (playerName, inputtedCode) => {
    console.log(playerName)
    console.log(inputtedCode)
    players[socket.id].name = playerName
    players[socket.id].type = 'player'
    players[socket.id].room = inputtedCode

    // const room = io.sockets.adapter.rooms[inputtedCode]
    // let allUsers;
    // if (room) {
    //   allUsers = room.sockets
    // }
    // console.log(allUsers)
    if (!rooms[inputtedCode]) {
      console.log('room does not exist')
      return
    } 
    rooms[inputtedCode].participants.push(socket.id)
    socket.join(inputtedCode)


    // rooms[inputtedCode].participants

    socket.to(inputtedCode).emit('playerTable', socket.id, players)
    // console.log(room)
  })

});

server.listen(port, () => {
  console.log(`TAP listening on port ${port}`);
});

instrument(io, { auth: false });

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}