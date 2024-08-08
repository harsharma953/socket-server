

const http = require('http');
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      //  const data = JSON.parse(message);
       let data = message;
       if (Buffer.isBuffer(data)) {
        // Convert Buffer to string if it's binary data
        data = data.toString('utf8');
        console.log(data);
      }
      // Broadcast to all clients except the sender
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          console.log(data);
          // client.send(data.frame);
          client.send(data);
        }
      });
    } catch (error) {
      console.error('Failed to process message', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
