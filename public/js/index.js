const socket = io();

let count = 0;
let active = false;

const homepage = document.getElementById('homepage')
const waitingroomPlayer = document.getElementById('waitingRoomPlayer')
const waitingroomHost = document.getElementById('waitingRoomHost')
const gameScreen = document.getElementById('gameScreen')
const displayCode = document.getElementById('roomCode') 

const hostButton = document.getElementById('hostButton')
const joinButton = document.getElementById('joinButton')

hostButton.addEventListener('click', () => {
    // if (!nameCheck(document.getElementById('gamename').value)) { return }
    const name = document.getElementById('gamename').value
    socket.emit('host', name)
    homepage.style.display = 'none'
    waitingroomHost.style.display = 'block'
})

socket.on('displayGameCode', (code) => {
    displayCode.style.display = 'block'
    displayCode.innerHTML = code
})

joinButton.addEventListener('click', () => {
    if (!nameCheck(document.getElementById('gamename').value)) { return }
    const name = document.getElementById('gamename').value
    const code = document.getElementById('gamecode').value
    socket.emit('join', name, code)
    homepage.style.display = 'none'
    waitingroomPlayer.style.display = 'block'
})

addEventListener('click', () => {
    // if (!active) { return }
    count += 1;
    document.getElementById('counter').innerHTML = count;
    socket.emit('updateScore', count)
})

socket.on('reset', (id) => {
    if (id == socket.id) {
        count = 0
        active = false
        document.getElementById('counter').innerHTML = count;
        homepage.style.display = 'block'
        waitingroomPlayer.style.display = 'none'
        waitingroomHost.style.display = 'none'
        gameScreen.style.display = 'none'
        displayCode.style.display = 'none'
    } 
})

socket.on('playerTable', (players) => {
    buildTable(players[socket.id].name)
})

function nameCheck(inputtedName) {
    if (!inputtedName) {
        alert('Please enter a name')
        return false
    }
    return true
}

function buildTable(playerName) {
    console.log(playerName)
    var table = document.getElementById('playerTable')

    const div = document.createElement('div')
    div.innerHTML = playerName
    table.append(div)
    
  }