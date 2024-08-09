const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;

let botClient = null;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
  }
});

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws) => {

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "frame") {
      // Broadcast the camera frame packet to all connected clients (excluding the Bot client)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } else if (parsedMessage.type === "command") {
      // Relay the command to the Python client
      if (botClient && botClient.readyState === WebSocket.OPEN) {
        botClient.send(JSON.stringify(parsedMessage));
      }
    } else if (parsedMessage.type === "connection") { //handle the connection between bot and portal
      console.log(`${parsedMessage.client} is ${parsedMessage.data}`);
      if (parsedMessage.data === "connected" && parsedMessage.client === "bot") {
        botClient = ws;
      }
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    }
  });

  ws.on("close", () => {
    if (ws === botClient) {
      botClient = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
