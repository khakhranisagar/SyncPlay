const http = require('http');
const { WebSocketServer } = require('ws');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SyncPlay signaling server running');
});

const wss = new WebSocketServer({ server });

// rooms[code] = { host: ws, peers: { peerId: ws } }
const rooms = {};

function cleanup(code) {
  const room = rooms[code];
  if (!room) return;
  const hostGone = !room.host || room.host.readyState !== 1;
  const peersGone = Object.values(room.peers).every(ws => ws.readyState !== 1);
  if (hostGone && peersGone) {
    delete rooms[code];
    console.log(`[room ${code}] cleaned up`);
  }
}

wss.on('connection', ws => {
  let myCode = null;
  let myRole = null;
  let myPeerId = null;

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // ── HOST: create room ──────────────────────────────
    if (msg.type === 'host_create') {
      myCode = msg.code;
      myRole = 'host';
      if (!rooms[myCode]) rooms[myCode] = { host: null, peers: {} };
      rooms[myCode].host = ws;
      ws.send(JSON.stringify({ type: 'hosting', code: myCode }));
      console.log(`[room ${myCode}] host connected`);
      return;
    }

    // ── PEER: join room ────────────────────────────────
    if (msg.type === 'peer_join') {
      myCode = msg.code;
      myRole = 'peer';
      myPeerId = msg.peerId;
      const room = rooms[myCode];
      if (!room || !room.host || room.host.readyState !== 1) {
        ws.send(JSON.stringify({ type: 'error', msg: 'Room not found or host offline' }));
        return;
      }
      room.peers[myPeerId] = ws;
      // Notify host a peer wants to join
      room.host.send(JSON.stringify({ type: 'peer_joined', peerId: myPeerId }));
      ws.send(JSON.stringify({ type: 'joined', peerId: myPeerId }));
      console.log(`[room ${myCode}] peer ${myPeerId} joined`);
      return;
    }

    // ── HOST → PEER: send offer ────────────────────────
    if (msg.type === 'offer') {
      const room = rooms[myCode];
      if (!room) return;
      const peerWs = room.peers[msg.peerId];
      if (peerWs && peerWs.readyState === 1) {
        peerWs.send(JSON.stringify({ type: 'offer', sdp: msg.sdp }));
      }
      return;
    }

    // ── PEER → HOST: send answer ───────────────────────
    if (msg.type === 'answer') {
      const room = rooms[myCode];
      if (!room || !room.host) return;
      if (room.host.readyState === 1) {
        room.host.send(JSON.stringify({ type: 'answer', peerId: myPeerId, sdp: msg.sdp }));
      }
      return;
    }

    // ── ICE candidates (both directions) ──────────────
    if (msg.type === 'ice_host_to_peer') {
      const room = rooms[myCode];
      if (!room) return;
      const peerWs = room.peers[msg.peerId];
      if (peerWs && peerWs.readyState === 1) {
        peerWs.send(JSON.stringify({ type: 'ice', candidate: msg.candidate }));
      }
      return;
    }

    if (msg.type === 'ice_peer_to_host') {
      const room = rooms[myCode];
      if (!room || !room.host) return;
      if (room.host.readyState === 1) {
        room.host.send(JSON.stringify({ type: 'ice_from_peer', peerId: myPeerId, candidate: msg.candidate }));
      }
      return;
    }
  });

  ws.on('close', () => {
    if (myCode) {
      const room = rooms[myCode];
      if (room) {
        if (myRole === 'host') room.host = null;
        if (myRole === 'peer' && myPeerId) delete room.peers[myPeerId];
      }
      cleanup(myCode);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`SyncPlay signaling server on port ${PORT}`));
