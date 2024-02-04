import { rooms } from "./roomsManager.js";
import { clients } from "./socketListener.js";

const chatsManager = (content, ws) => {
  const { action, data } = content;

  console.log("INCOMING CHATS MANAGER", action, data, ws.session?.user.name);

  const handler = {
    send: sendMessage,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

const sendMessage = async (data, ws) => {
  const { roomId, text, sender, attachment } = data;
  const message = { text, sender, attachment };

  if (roomId === 0) {
    broadcastMessageToLobbyChat(message);
  } else {
    broadcastMessageToRoomChat(message, roomId, ws);
  }
};

const broadcastMessageToLobbyChat = (message) => {
  Object.values(clients).forEach((clientWs) => {
    if (clientWs.session && clientWs.session.user && !clientWs.session.room) {
      clientWs.send(
        JSON.stringify({
          type: "receiveChatMessage",
          content: {
            success: true,
            message: "Receive message - lobby.",
            data: message,
          },
        })
      );
    }
  });
};

const broadcastMessageToRoomChat = (message, roomId, ws) => {
  const room = rooms[roomId];

  if (!room) {
    ws.send(
      JSON.stringify({
        type: "sendMessageResponse",
        content: { success: false, message: "Room not found.", data: null },
      })
    );
    return;
  }

  if (!room.players.some((player) => player.user._id === message.sender.id)) {
    ws.send(
      JSON.stringify({
        type: "sendMessageResponse",
        content: { success: false, message: "You are not in the room.", data: null },
      })
    );
    return;
  }

  room.players.forEach((player) => {
    player.ws.send(
      JSON.stringify({
        type: "receiveChatMessage",
        content: {
          success: true,
          message: "Receive message - room.",
          data: message,
        },
      })
    );
  });
};

export const broadcastLogToRoomChat = (room, logType, logMessage) => {
  if (!room) {
    return;
  }

  room.players.forEach((player) => {
    player.ws.send(
      JSON.stringify({
        type: "receiveChatLog",
        content: {
          success: true,
          message: "Receive log - room.",
          data: { logType, logMessage },
        },
      })
    );
  });
};

export default chatsManager;
