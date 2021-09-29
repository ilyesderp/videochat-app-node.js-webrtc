//var fs = require('fs');
const express = require('express')
const app = express()
const http = require('http')
//const https = require('https');

var httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer, { allowEIO3: true });

const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer');


// setting peerjs server:
//var PeerServer = require('peer').PeerServer;


/*var server2 = PeerServer({
  port: 9000,
  path: '/myapp',
  ssl: {
    key: fs.readFileSync('/etc/letsencrypt/live/newton-schools.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/newton-schools.com/fullchain.pem')
  },
  proxied: true
});*/



const PORT = process.env.PORT || 4000

httpServer.listen(PORT)


const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});

app.use('/peerjs', peerServer);



app.set('view engine', 'ejs')
app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})





io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId)
		//socket.to(roomId).broadcast.emit('user-connected', userId) // error: undefined.
    socket.broadcast.to(roomId).emit('user-connected', userId) //works

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userId)
		})
		socket.on('disconnect', () => {
			//socket.to(roomId).broadcast.emit('user-disconnected', userId)//error: undefined
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
		})
	})
})



