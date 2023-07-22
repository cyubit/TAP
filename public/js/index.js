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
const startButton = document.getElementById('startButton')

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

startButton.addEventListener('click', () => {
    active = false
    waitingroomHost.style.display = 'none'
    resultsScreen.style.display = 'block'
    socket.emit('startGame')
})

addEventListener('click', () => {
    if (!active) { return }
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

socket.on('playerTable', (roomPlayers, players) => {
    buildTable(roomPlayers, players)
})

socket.on('startGame', (players) => {
    if (players[socket.id].type == 'host') {
        return
    }
    waitingroomPlayer.style.display = 'none'
    gameScreen.style.display = 'block'
    active = true
})

socket.on('timer', (seconds, players) => {
    if (players[socket.id].type != 'host') {return}
    document.getElementById('time').innerHTML = seconds;
})

socket.on('updateScoretable', (players) => {
    let scoreTable = document.getElementById('resultsTable');

    const newTable = document.createElement('tbody');
    for (i in players) {
        if (players[i].type == 'host') {
            continue
        }
        const row = newTable.insertRow(0);
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        cell1.appendChild(document.createTextNode(players[i].name));
        cell2.appendChild(document.createTextNode(players[i].clicks));
    }

    scoreTable.innerHTML = newTable.innerHTML
})

socket.on('endGame', (players) => {
    active = false
})

function nameCheck(inputtedName) {
    if (!inputtedName) {
        alert('Please enter a name')
        return false
    }
    return true
}

function buildTable(roomPlayers, players) {
    var table = document.getElementById('playerTable')
    const div = document.createElement('div')
    div.innerHTML = players[roomPlayers].name + ' - ' + players[roomPlayers].type
    table.append(div)
}