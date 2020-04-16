class Client {
  socket

  constructor() {
    this.socket = io()
    this.preload()
  }

  preload = () => {
    this.socket.on('newRoomCreated', (data) => {
      // Join the private room with the code
      document.getElementById('privateCode').value = data.gameId
      this.joinRoomByCode()
    })

    this.socket.on('currentPlayers', (players) => {
      // Render current players in this room
      document.getElementById('home').style.display = 'none'
      document.getElementById('room').style.display = 'flex'
      document.getElementById('players').innerHTML = ''
      players.forEach((player, i) => {
        let user = document.createElement('div')
        user.innerHTML = 'Player '+(i+1)+' : '+player.username+'\n'
        document.getElementById('players').appendChild(user)
      })
    })

    this.socket.on('disconnection', (players) => {
      // Render current players in this room
      document.getElementById('players').innerHTML = ''
      players.forEach((player, i) => {
        let user = document.createElement('div')
        user.innerHTML = 'Player '+(i+1)+' : '+player.username+'\n'
        document.getElementById('players').appendChild(user)
      })
    })
  }

  createNewRoom = () => {
    let username = document.getElementById('username').value
    this.socket.emit('hostCreateNewRoom', {username: username})
  }

  joinRoomByCode = () => {
    let username = document.getElementById('username').value
    let gameId = document.getElementById('privateCode').value
    document.getElementById('roomCode').innerHTML = gameId
    this.socket.emit('joinRoomByCode', {gameId: gameId, username: username})
  }
}

let client = new Client()
