var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

app.use('/css',express.static(__dirname + '/css'))
app.use('/js',express.static(__dirname + '/js'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

http.listen(8080, function() {
  console.log('listening on *:8080')
})

io.on('connection', function(socket) {

  // Create a new private game and generate random access code
  socket.on('hostCreateNewRoom', function(data) {
    let gameId = generateRoomId(6)
    this.emit('newRoomCreated', {gameId: gameId, socketId: this.id})
    this.join(gameId.toString())
    players = [{username: data.username, socketId: this.id}]
    this.adapter.rooms[gameId].players = players
  })

  socket.on('joinRoomByCode', function(data) {
    let room = this.adapter.rooms[data.gameId]
    if (room && room.length > 0 && room.length < 11) {
      this.join(data.gameId.toString())
      let hasAlreadyJoined = false
      this.adapter.rooms[data.gameId].players.forEach((player, i) => {
        if (player.socketId === this.id)
          hasAlreadyJoined = true
      })
      if (!hasAlreadyJoined)
        this.adapter.rooms[data.gameId].players.push({username: data.username, socketId: this.id})
      io.in(data.gameId).emit('currentPlayers', this.adapter.rooms[data.gameId].players)
    }
  })

  socket.on('disconnecting', function() {
    var rooms = socket.rooms
    Object.entries(rooms).forEach((room, i) => {
      if (room[0] !== socket.id) {
        let players = this.adapter.rooms[room[0]].players
        players.forEach((player, i) => {
          if (player.socketId === socket.id)
            players.splice(i, 1)
        })
        socket.broadcast.to(room[0]).emit('disconnection', this.adapter.rooms[room[0]].players)
      }
    })
  })
})

generateRoomId = (length) => {
   let result = ''
   let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
   let charactersLength = characters.length
   for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return result
}
