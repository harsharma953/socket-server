// const WebSocket = require('ws');
// const PORT = process.env.PORT || 8080;

// const wss = new WebSocket.Server({ port: PORT });

// wss.on('connection', ws => {
//   console.log('Client connected');

//   ws.on('message', message => {
//     const data = JSON.parse(message);
//     //console.log(data.frame);
//     wss.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(data.frame);
//       }
//     });
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// console.log(`WebSocket server is running on ws://localhost:${PORT}`);

console.log('hello websocket');