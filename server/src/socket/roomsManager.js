import Room from "./Room.js";
import { broadcastRoomsList } from "./notifyAll.js";

const rooms = {};

const roomsManager = (content, ws) => {
  const { action, data } = content;

  const handler = {
    create: createRoom,
    join: joinRoom,
    leave: leaveRoom,
    ready: readyPlayer,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

const createRoom = (data, ws) => {
  try {
    const { roomName, players } = data;
    const room = new Room(roomName, players);
    rooms[room.id] = room;

    ws.send(
      // Response to creator client
      JSON.stringify({
        type: "createRoomResponse",
        content: { success: true, message: "Create room success.", data: { room: room.getRoomData() } },
      })
    );

    broadcastRoomsList(); // Broadcast to all clients
  } catch (error) {
    console.log("Create room failed.", error);
  }
};

const joinRoom = (data, ws) => {
  const { roomId, player } = data;
  player.ws = ws;
  const room = rooms[roomId];

  if (room.joinRoom(player, ws)) {
    ws.send(
      // Response to joiner client
      JSON.stringify({
        type: "joinRoomResponse",
        content: { success: true, message: "Join room success.", data: { room: room.getRoomData() } },
      })
    );

    broadcastRoomsList(); // Broadcast to all clients
  } else {
    console.log("Join room failed.", error);
    ws.send(
      JSON.stringify({
        type: "joinRoomResponse",
        content: { success: false, message: "Join room failed.", data: null },
      })
    );
  }
};

const leaveRoom = (data, ws) => {
  const { roomId, player } = data;
  const room = rooms[roomId];

  if (room.leaveRoom(player)) {
    ws.send(
      JSON.stringify({
        type: "leaveRoomResponse",
        content: { success: true, message: "Leave room success.", data: { room: room.getRoomData() } },
      })
    );

    if (room.players.length === 0) {
      delete rooms[roomId];
    }

    broadcastRoomsList();
  } else {
    console.log("Leave room failed.", error);
    ws.send(
      JSON.stringify({
        type: "leaveRoomResponse",
        content: { success: false, message: "Leave room failed.", data: null },
      })
    );
  }
};

const readyPlayer = (data, ws) => {
  const { roomId, player } = data;
  const room = rooms[roomId];

  if (room.readyPlayer(player)) {
    ws.send(
      JSON.stringify({
        type: "readyPlayerResponse",
        content: { success: true, message: "Ready player success.", data: { room: room.getRoomData() } },
      })
    );
  } else {
    console.log("Ready player failed.", error);
    ws.send(
      JSON.stringify({
        type: "readyPlayerResponse",
        content: { success: false, message: "Ready player failed.", data: null },
      })
    );
  }
};

export const getAllRooms = () => {
  return Object.values(rooms).map((room) => room.getRoomDataForList());
};

// for a single client
export const sendRoomsList = (ws) => {
  try {
    const roomsList = Object.values(rooms).map((room) => room.getRoomData());
    ws.send(
      // Response to client
      JSON.stringify({
        type: "sendRoomsList",
        content: { success: true, message: "Rooms list.", data: { rooms: roomsList } },
      })
    );
  } catch (error) {
    console.log("Send rooms list failed.", error);
  }
};

export default roomsManager;
