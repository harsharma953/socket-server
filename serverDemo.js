const WebSocket = require('ws');
const PORT = 8080;
const IP_ADDRESS = '172.20.10.12'; // Replace with your server's IP address

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    const data = JSON.parse(message);
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

console.log(`WebSocket server is running on ws://${IP_ADDRESS}:${PORT}`);
