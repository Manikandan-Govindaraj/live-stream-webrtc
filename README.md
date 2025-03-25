# WebSocket server

WebSocket is used for signaling to exchange WebRTC connection details (like SDP and ICE candidates) between peers.

## Development server

To start a local web socket server, run:

```bash
cd signaling-server
node server.js
```

# LocalPeer

local-peer app, implement the WebRTC logic to create an offer and handle the remote peer's answer.

## Development server

To start a local development server, create new terminal and run:

```bash
cd local-peer
ng serve --port 4200
```

# RemotePeer

remote-peer app, implement the WebRTC logic to handle the local peer's offer and send an answer.

## Development server

To start a local development server, create new terminal and run:

```bash
cd remote-peer
ng serve --port 4201
```

Open the local peer app in one browser tab (http://localhost:4200) and the remote peer app in another tab (http://localhost:4201).

Click the "Start Call" button in the local peer app to initiate the WebRTC connection.
