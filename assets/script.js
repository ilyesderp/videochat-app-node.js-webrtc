const socket = io();
const videoGrid = document.getElementById('videoGrid')
const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer(undefined, {
	//path: '/myapp',
	//host: 'newton-schools.com',
	//port: 4000,
	host:'peerjs-server.herokuapp.com', 
	port:443,
	secure: true,
	iceServers: [{
		urls: 'turn:numb.viagenie.ca',
		credential: 'muazkh',
		username: 'webrtc@live.com'
	},
	{
		urls: 'turn:192.158.29.39:3478?transport=udp',
		credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
		username: '28224511:1379330808'
	},
	{
		urls: 'turn:192.158.29.39:3478?transport=tcp',
		credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
		username: '28224511:1379330808'
	},
	{
		urls: 'turn:turn.bistri.com:80',
		credential: 'homeo',
		username: 'homeo'
	 },
	 {
		urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
		credential: 'webrtc',
		username: 'webrtc'
	}, 
	{ urls: 'turn:turn.newton-schools.com', credential: 'NUM509022', username: 'ilyes' },
	{
		urls: [
			  'stun:stun.l.google.com:19302' ,
			  'stun:stun1.l.google.com:19302' ,
			  'stun:stun2.l.google.com:19302' ,
			  'stun:stun3.l.google.com:19302' ,
			  'stun:stun4.l.google.com:19302' ,
			  'stun:stun01.sipphone.com' ,
			  'stun:stun.ekiga.net' ,
			  'stun:stun.fwdnet.net' ,
			  'stun:stun.ideasip.com' ,
			  'stun:stun.iptel.org' ,
			  'stun:stun.rixtelecom.se' ,
			  'stun:stun.schlund.de' ,
			  'stun:stunserver.org' ,
			  'stun:stun.softjoys.com' ,
			  'stun:stun.voiparound.com' ,
			  'stun:stun.voipbuster.com' ,
			  'stun:stun.voipstunt.com' ,
			  'stun:stun.voxgratia.org' ,
			  'stun:stun.xten.com' ,
		]
	}]
})


const myPeer = new Peer(undefined, {
	//path: '/myapp',
	//host: 'newton-schools.com',
	//port: 4000,
	host:'peerjs-server.herokuapp.com', 
	port:443,
	secure: true,
	iceServers: [{
		urls: 'turn:numb.viagenie.ca',
		credential: 'muazkh',
		username: 'webrtc@live.com'
	},
	{
		urls: 'turn:192.158.29.39:3478?transport=udp',
		credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
		username: '28224511:1379330808'
	},
	{
		urls: 'turn:192.158.29.39:3478?transport=tcp',
		credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
		username: '28224511:1379330808'
	},
	{
		urls: 'turn:turn.bistri.com:80',
		credential: 'homeo',
		username: 'homeo'
	 },
	 {
		urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
		credential: 'webrtc',
		username: 'webrtc'
	}, 
	{ urls: 'turn:turn.newton-schools.com', credential: 'NUM509022', username: 'ilyes' },
	{
		urls: [
			  'stun:stun.l.google.com:19302' ,
			  'stun:stun1.l.google.com:19302' ,
			  'stun:stun2.l.google.com:19302' ,
			  'stun:stun3.l.google.com:19302' ,
			  'stun:stun4.l.google.com:19302' ,
			  'stun:stun01.sipphone.com' ,
			  'stun:stun.ekiga.net' ,
			  'stun:stun.fwdnet.net' ,
			  'stun:stun.ideasip.com' ,
			  'stun:stun.iptel.org' ,
			  'stun:stun.rixtelecom.se' ,
			  'stun:stun.schlund.de' ,
			  'stun:stunserver.org' ,
			  'stun:stun.softjoys.com' ,
			  'stun:stun.voiparound.com' ,
			  'stun:stun.voipbuster.com' ,
			  'stun:stun.voipstunt.com' ,
			  'stun:stun.voxgratia.org' ,
			  'stun:stun.xten.com' ,
		]
	}]
})


  const peers = {}
let myVideoStream
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream
		addVideoStream(myVideo, stream)

		socket.on('user-connected', (userId) => {
			setTimeout(connectToNewUser, 3000, userId, stream)
			//connectToNewUser(userId, stream);
			alert('Somebody connected', userId)
		})

		peer.on('call', (call) => {
			call.answer(stream)
			const video = document.createElement('video')
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream)
			})
		})

		let text = $('input')

		$('html').keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit('message', text.val())
				text.val('')
			}
		})

		socket.on('createMessage', (message, userId) => {
			$('ul').append(`<li >
								<span class="messageHeader">
									<span>
										From 
										<span class="messageSender">Someone</span> 
										to 
										<span class="messageReceiver">Everyone:</span>
									</span>
									${new Date().toLocaleString('en-US', {
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
								</span>
								<span class="message">${message}</span>
							
							</li>`)
			scrollToBottom()
		})
	}).catch(function(err) { console.log(err.name + ": " + err.message); });

socket.on('user-disconnected', (userId) => {
	if (peers[userId]) peers[userId].close()
})

peer.on('open', (id) => {
	socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream)
	const video = document.createElement('video')
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream)
	})
	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
}

const addVideoStream = (video, stream) => {
	console.log(video)
	console.log(stream)
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
}

const scrollToBottom = () => {
	var d = $('.mainChatWindow')
	d.scrollTop(d.prop('scrollHeight'))
}

const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}

const setMuteButton = () => {
	const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const setUnmuteButton = () => {
	const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const playStop = () => {
	console.log('object')
	let enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		setStopVideo()
		myVideoStream.getVideoTracks()[0].enabled = true
	}
}

const setStopVideo = () => {
	const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

const setPlayVideo = () => {
	const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}