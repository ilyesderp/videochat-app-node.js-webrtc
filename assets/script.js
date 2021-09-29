const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: 'newton-schools.com',
    port: '9000',
    path: '/myapp',
    secure: true,
    config: {'iceServers': [
        { url: 'turn:turn.newton-schools.com', credential: 'NUM509022', username: 'ilyes' }
      ]} 
  });

const peers = {};
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then( stream => {
        addVideoStream(myVideo, stream);  
        
        

        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
                })
            })

        
        socket.on('user-connected', userId =>{//here edit user_connected
                if(userId!=myPeer.id){
                    console.log("New user: "+userId);
                    console.log("stream: " + stream);
                    setTimeout(connectToNewUser(userId,stream), 1000);
                }
            })
            

        
        });


//console.log("roo: " + ROOM_ID + " -----" + "peer id: " + myPeer.id) 
//socket.emit('connection-request', ROOM_ID, myPeer.id);//added this to try and correct long loading time.


socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});




function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    console.log(video);
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  }