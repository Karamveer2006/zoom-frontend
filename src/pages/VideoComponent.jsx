import React, { useEffect, useRef, useState } from 'react';
import '../style/videoComponent.css'; 
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';

import io from "socket.io-client";
import { Link } from 'react-router-dom';

const server_url = "http://localhost:3000";

var connections = {};
var iceCandidateQueue = {}; 

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

const RemoteVideo = ({ stream, id }) => {
    const videoRef = useRef(null);
    
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(error => {
                console.error("Autoplay failed for stream", id, error);
            });
        }
    }, [stream, id]);

    return (
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#202124' }} 
        />
    );
};

function VideoComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    
    let [message, setMessage] = useState("");
    let [messages, setMessages] = useState([]);
    let [newMessages, setNewMessages] = useState(0);
    let [showModal, setModel] = useState(false);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [localVideoOn, setLocalVideoOn] = useState(true);
    let [localAudioOn, setLocalAudioOn] = useState(true);
    let [isScreenSharing, setIsScreenSharing] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let usernameRef = useRef(""); // Keeps track of username inside socket callbacks

    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    let [peerNames, setPeerNames] = useState({}); // NEW: Dictionary to map socketId -> username

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
            setVideoAvailable(!!videoPermission);

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
            setAudioAvailable(!!audioPermission);

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            if (videoPermission || audioPermission) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: !!videoPermission, audio: !!audioPermission });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if (localVideoRef.current && window.localStream) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    let getUserMediaSuccess = (stream) => {
        if (window.localStream) {
            try { window.localStream.getTracks().forEach(track => track.stop()); } catch (error) { console.log(error); }
        }

        window.localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    // Send username along with the signal
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription, "username": usernameRef.current }));
                }).catch(e => console.log(e));
            });
        }
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let getUserMedia = () => {
        if ((localVideoOn && videoAvailable) || (localAudioOn && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: localVideoOn, audio: localAudioOn })
                .then(getUserMediaSuccess)
                .catch((error) => console.log(error));
        }
    }

    let gotMessageFromserver = async (fromId, incomingMessage) => {
        var signal = JSON.parse(incomingMessage);
        
        // NEW: If the signal contains a username, save it!
        if (signal.username) {
            setPeerNames(prev => ({ ...prev, [fromId]: signal.username }));
        }

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                try {
                    await connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    if (iceCandidateQueue[fromId] && iceCandidateQueue[fromId].length > 0) {
                        for (const candidate of iceCandidateQueue[fromId]) {
                            await connections[fromId].addIceCandidate(candidate).catch(e => console.log(e));
                        }
                        iceCandidateQueue[fromId] = []; 
                    }
                    if (signal.sdp.type === "offer") {
                        const description = await connections[fromId].createAnswer();
                        await connections[fromId].setLocalDescription(description);
                        // Send username along with the answer
                        socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription, "username": usernameRef.current }));
                    }
                } catch (e) { console.log("SDP Error:", e); }
            }
            if (signal.ice) {
                const candidate = new RTCIceCandidate(signal.ice);
                if (connections[fromId].remoteDescription && connections[fromId].remoteDescription.type) {
                    connections[fromId].addIceCandidate(candidate).catch(e => console.log(e));
                } else {
                    if (!iceCandidateQueue[fromId]) iceCandidateQueue[fromId] = [];
                    iceCandidateQueue[fromId].push(candidate);
                }
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        if (socketIdSender === socketIdRef.current) return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        
        if (!showModal) {
            setNewMessages((prevCount) => prevCount + 1); 
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromserver);

        socketRef.current.on('connect', () => {
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideos((prevVideos) => prevVideos.filter((vid) => vid.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, client) => {
                client.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate !== null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(vid => vid.socketId === socketListId);
                        if (videoExists) {
                            setVideos(prevVideos => {
                                const updatedVideos = prevVideos.map(vid => vid.socketId === socketListId ? { ...vid, stream: event.stream } : vid);
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = { socketId: socketListId, stream: event.stream, autoplay: true, playsinline: true };
                            setVideos((prevVideos => {
                                const updatedVideos = [...prevVideos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }));
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blacksilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blacksilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        try { connections[id2].addStream(window.localStream); } catch (error) { console.log(error)}

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                // Send username along with the offer
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription, "username": usernameRef.current }));
                            }).catch(e => console.log(e));
                        });
                    }
                }
            });
        });
    }

    let connect = () => {
        setAskForUsername(false);
        getUserMedia();
        connectToSocketServer();
    }

    const toggleAudio = () => {
        if (window.localStream) {
            const audioTrack = window.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setLocalAudioOn(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setLocalVideoOn(videoTrack.enabled);
            }
        }
    };

    const handleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                for (let id in connections) {
                    const sender = connections[id].getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = new MediaStream([screenTrack]);
                }

                screenTrack.onended = () => { revertToWebcam(); };
                setIsScreenSharing(true);
            } catch (error) { console.error("Error sharing screen:", error); }
        } else {
            revertToWebcam();
        }
    };

    const revertToWebcam = () => {
        const videoTrack = window.localStream.getVideoTracks()[0];
        for (let id in connections) {
            const sender = connections[id].getSenders().find(s => s.track.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = window.localStream;
        }
        setIsScreenSharing(false);
    };

    const endCall = () => {
        if (window.localStream) window.localStream.getTracks().forEach(track => track.stop());
        for (let id in connections) connections[id].close();
        connections = {};
        if (socketRef.current) socketRef.current.disconnect();
        setVideos([]);
        setAskForUsername(true);
    };

    let sendMessage = () => {
        if (message.trim() === "") return;
        socketRef.current.emit("chat-message", message, username, socketIdRef.current); 
        setMessages(prev => [...prev, { sender: username, data: message }]);
        setMessage("");
    }

    const pageStyle = { padding: '0', fontFamily: "'Roboto', sans-serif", height: '100vh', backgroundColor: '#202124', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
    const videoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', padding: '12px', flex: 1, width: showModal ? 'calc(100% - 350px)' : '100%', transition: 'width 0.3s ease-in-out' };
    const videoWrapperStyle = { position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#3c4043', aspectRatio: '16/9', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' };
    const nameTagStyle = { position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', zIndex: 5 };
    const controlsStyle = { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', backgroundColor: '#202124', padding: '0 20px', zIndex: 1000 };
    const iconButtonStyle = (isActive, isEndCall = false) => ({ backgroundColor: isEndCall ? '#ea4335' : isActive ? '#3c4043' : '#ffffff', color: isEndCall ? 'white' : isActive ? 'white' : '#202124', width: '48px', height: '48px', '&:hover': { backgroundColor: isEndCall ? '#d93025' : isActive ? '#4a4e52' : '#f1f3f4' } });
    const chatSidebarStyle = { position: "fixed", top: 0, right: showModal ? "0" : "-350px", width: "350px", height: "100vh", backgroundColor: "#ffffff", boxShadow: "-5px 0 15px rgba(0,0,0,0.2)", transition: "right 0.3s ease-in-out", zIndex: 1100, display: "flex", flexDirection: "column" };

    return (
        <div style={pageStyle}>
            {askForUsername === true ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                    <h1>Ready to join?</h1>
                    <div style={{ width: '100%', maxWidth: '480px', marginBottom: '20px' }}>
                        <div style={videoWrapperStyle}>
                             <video ref={localVideoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <TextField 
                            label="Your Name" 
                            variant="outlined" 
                            value={username} 
                            // Update ref at the same time to ensure socket closures have the latest value
                            onChange={(e) => { setUsername(e.target.value); usernameRef.current = e.target.value; }} 
                            sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'gray' } }} 
                        />
                        <Button variant="contained" onClick={connect} sx={{ height: '56px', backgroundColor: '#1a73e8', px: 4 }}>Join now</Button>
                    </div>
                </div> 
            ) : (
                <>
                    <div style={videoGridStyle}>
                        <div style={videoWrapperStyle}>
                            <span style={nameTagStyle}>You</span>
                            <video ref={localVideoRef} autoPlay muted playsInline style={{width:'100%', height:'100%', objectFit:'cover'}}></video>
                        </div>
                        {videos.map((vid) => (
                            <div key={vid.socketId} style={videoWrapperStyle}>
                                {/* Check the peerNames dictionary first, fallback to socketId if name hasn't arrived yet */}
                                <span style={nameTagStyle}>{peerNames[vid.socketId] || `User ${vid.socketId.substring(0, 5)}`}</span>
                                <RemoteVideo stream={vid.stream} id={vid.socketId} />
                            </div>
                        ))}
                    </div>
                    <div style={controlsStyle}>
                        <IconButton onClick={toggleAudio} sx={iconButtonStyle(localAudioOn)}>{localAudioOn ? <MicIcon /> : <MicOffIcon />}</IconButton>
                        <IconButton onClick={toggleVideo} sx={iconButtonStyle(localVideoOn)}>{localVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}</IconButton>
                        {screenAvailable && (
                            <IconButton onClick={handleScreenShare} sx={iconButtonStyle(!isScreenSharing)}>{isScreenSharing ? <StopScreenShareIcon color="primary" /> : <ScreenShareIcon />}</IconButton>
                        )}
                        <IconButton onClick={() => { setModel(!showModal); setNewMessages(0); }} sx={iconButtonStyle(showModal)}><Badge badgeContent={newMessages} color="error"><MessageIcon /></Badge></IconButton>
                        <IconButton onClick={endCall} sx={iconButtonStyle(true, true)}><Link to="/home"><CallEndIcon style={{color: 'white'}} /></Link></IconButton>
                    </div>
                    <div style={chatSidebarStyle}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0 }}>In-call messages</h3><IconButton onClick={() => setModel(false)}><CloseIcon /></IconButton></div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                            {messages.map((item, index) => (
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 'bold' }}>{item.sender === username ? 'You' : item.sender}</p>
                                    <div style={{ backgroundColor: '#f1f3f4', padding: '8px 12px', borderRadius: '8px', display: 'inline-block', maxWidth: '90%' }}><p style={{ margin: 0, fontSize: '14px' }}>{item.data}</p></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '20px', display: 'flex', gap: '8px' }}>
                            <TextField fullWidth size="small" placeholder="Send message" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null} />
                            <Button variant="contained" onClick={sendMessage}>Send</Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default VideoComponent;