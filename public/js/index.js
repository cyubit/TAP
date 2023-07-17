// 1. Detect clicks on the page
// 2. For each click, increment the counter variable by 1
// 3. Update the counter paragraph with the new value

let count = 0;

addEventListener('click', () => {
    count += 1;
    document.getElementById('counter').innerHTML = count;
})

socket.on('update', (players) => {
    console.log(players)
})