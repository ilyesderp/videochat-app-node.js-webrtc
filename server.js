var fs = require('fs');
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
//const httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
/*httpProxy.createProxyServer({
  target:'https://videochat-app.newton-schools.com/',
  ws: true
}).listen(8000);*/

// setting peerjs server:
var PeerServer = require('peer').PeerServer;

var server2 = PeerServer({
  port: 9000,
  path: '/myapp',
  ssl: {
    key: fs.readFileSync('/etc/letsencrypt/live/newton-schools.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/newton-schools.com/fullchain.pem')
  }
});


app.set('view engine', 'ejs')
app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})



io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)//here

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(4000)