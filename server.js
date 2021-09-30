var fs = require('fs');
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
    //proxied: true,
    debug: true,
    path: '/myapp',
    ssl: { key: fs.readFileSync('/etc/letsencrypt/live/document-sharing-app.newton-schools.com/privkey.pem'),
    	   cert: fs.readFileSync('/etc/letsencrypt/live/document-sharing-app.newton-schools.com/fullchain.pem') 
		}
})
const { v4: uuidv4 } = require('uuid')


app.use('/peerjs', peerServer)
app.use(express.static('assets'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room })
})

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId)
		socket.broadcast.to(roomId).emit('user-connected', userId) //works

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userId)
		})
		socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
		})
	})
})

const PORT = process.env.PORT || 4000
const HOSTNAME = "newton-schools.com";
//server.listen(PORT)


server.listen(PORT, HOSTNAME, () => {
	console.log(`Server running at https://${HOSTNAME}:${PORT}/`);
  });