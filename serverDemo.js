const WebSocket = require('ws');
const PORT = 8080;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const wss = new WebSocket.Server({ port: PORT, host: HOST });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', message => {
    const data = JSON.parse(message);
    // Broadcast the received frame to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.frame);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server is running on ws://<your-local-ip>:${PORT}`);
