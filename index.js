import { ConnectionStatus, ClientType, MsgType, CommandType } from "./constants/enum.js";
import { WebSocketServer } from "ws";
import { BOT_DISCONNECTED_MSG, BOT_PAUSED_MSG } from "./constants/message.js";

// const WebSocket = require("ws");
const PORT = 8080;

let botClient = null;
let portalClient = null;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.msgType) {
        case "frame":
          if (portalClient && portalClient.status === ConnectionStatus.CONNECTED) {
            portalClient.ws.send(JSON.stringify(parsedMessage));
          }
          break;

        case "command":
          if (parsedMessage.clientType === ClientType.PORTAL && botClient.status === ConnectionStatus.CONNECTED){
            if(parsedMessage.data.toLowerCase() !== botClient.currentFrameCommand)
            {
            botClient.ws.send(JSON.stringify(parsedMessage));
            console.log(`${parsedMessage.data} command sent to ${ClientType.BOT}: ${new Date().toString()}`);
            botClient.currentFrameCommand = parsedMessage.data.toLowerCase();
            }
          }
          break;

        case "identify":
          console.log(`${parsedMessage.clientType} ${parsedMessage.data}: ${new Date().toString()}`);
          if (parsedMessage.clientType.toLowerCase() === ClientType.BOT ){
            if(parsedMessage.data.toLowerCase() === ConnectionStatus.CONNECTED){
              botClient = { ws,status: ConnectionStatus.CONNECTED, connectedMsg: parsedMessage , currentFrameCommand : CommandType.STOP};
            }
            else if (parsedMessage.data.toLowerCase() === ConnectionStatus.PAUSED){
              botClient.currentFrameCommand = CommandType.PAUSE;
            }
            if (portalClient) {
              portalClient.ws.send(JSON.stringify(parsedMessage));
            }
          } else if (parsedMessage.clientType.toLowerCase() === ClientType.PORTAL && parsedMessage.data.toLowerCase() === ConnectionStatus.CONNECTED) {
            portalClient = { ws,status: ConnectionStatus.CONNECTED,connectedMsg: parsedMessage};
            if (botClient) {
              portalClient.ws.send(JSON.stringify(botClient.currentFrameCommand === ConnectionStatus.PAUSED ? BOT_PAUSED_MSG : botClient.connectedMsg));
            }
          }
          break;

        default:
          console.log("Error in message type");
      }
    } catch (error) {
      console.error("Exception : Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    if (ws === botClient?.ws) {
      console.log(`Bot disconnected ${new Date().toString()}`)
      if(portalClient){
        portalClient.ws.send(JSON.stringify(BOT_DISCONNECTED_MSG))
      }
      botClient = null;
    }
    else if(ws === portalClient?.ws){
      console.log(`Portal disconnected ${new Date().toString()}`)
      portalClient = null;
    }
  });
});

console.log(`WebSocket server is running on port ${PORT}`);
