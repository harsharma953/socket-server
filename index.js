const http = require('http');
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

let pythonClient = null;

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
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log('connected');
        if (parsedMessage.type === 'frame') {
            // Broadcast the camera frames to all connected clients (excluding the Python client)
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'frame', data: parsedMessage.data }));
                }
            });
        } else if (parsedMessage.type === 'command') {
            // Relay the command to the Python client
            if (pythonClient && pythonClient.readyState === WebSocket.OPEN) {
                pythonClient.send(JSON.stringify({ type: 'command', data: parsedMessage.data }));
            }
        } else if (parsedMessage.type === 'registerPythonClient') {
            // Register Python client
            console.log('Camera Sender connected');
            pythonClient = ws;
        }
    });

    ws.on('close', () => {
        // Handle client disconnection, reset pythonClient if necessary
        if (ws === pythonClient) {
            pythonClient = null;
        }
    });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


