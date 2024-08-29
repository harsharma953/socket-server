import { ClientType, ConnectionStatus, MsgType } from "./enum.js";

export const BOT_DISCONNECTED_MSG = {
  clientType: ClientType.BOT,
  msgType: MsgType.IDENTIFY,
  data: ConnectionStatus.DISCONNECTED,
};

export const BOT_PAUSED_MSG = {
  clientType: ClientType.BOT,
  msgType: MsgType.IDENTIFY,
  data: ConnectionStatus.PAUSED,
};
