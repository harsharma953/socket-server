const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;

let botClient = null;

const server = http.createServer((req, res) => {
  if (req.url === "/test") {
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
    try {
      const parsedMessage = JSON.parse(message);
      const timestamp = new Date().toISOString(); 

      switch (parsedMessage.type) {
        case "frame":
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(parsedMessage));
            }
          });
          break;
        case "command":
          if (parsedMessage.client === "portal" && botClient?.ws?.readyState === WebSocket.OPEN) {
            console.log(`${parsedMessage.data} command sent to bot: ${timestamp}`);
            botClient.ws.send(JSON.stringify(parsedMessage));
          }
          break;
        case "connection":
          console.log(`${parsedMessage.client} is ${parsedMessage.data}: ${timestamp}`);
          if (parsedMessage.client === "bot") {
            botClient = parsedMessage.data === "connected" ? { ws, parsedMessage } : null;
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(parsedMessage));
              }
            });
          } else if (parsedMessage.client === "portal" && botClient?.ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(botClient.parsedMessage)); // Send initial message to portal
          }
          break;
        default:
          console.log('Error in message type')
      }
    } catch (error) {
      console.error("Error parsing message:", error);
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
