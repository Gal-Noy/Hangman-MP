import Room from "./Room.js";
import { clients } from "./socketListener.js";
import { broadcastLobbyUsersList } from "./usersManager.js";

const rooms = {};

const roomsManager = (content, ws) => {
  const { action, data } = content;

  console.log("INCOMING ROOM MANAGER", action, data, ws.session.user.name);

  const handler = {
    list: sendRoomsList,
    create: createRoom,
    join: joinRoom,
    leave: leaveRoom,
    ready: toggleReadyPlayer,
    unready: toggleReadyPlayer,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

const createRoom = (data, ws) => {
  try {
    const { name } = data;
    const players = [{ user: ws.session.user, ws }]; // Join the creator to the room

    const room = new Room(name, players);
    rooms[room.id] = room;

    ws.session.room = room;
    ws.send(
      // Response to creator client
      JSON.stringify({
        type: "createRoomResponse",
        content: { success: true, message: "Create room success.", data: { room: room.getRoomData() } },
      })
    );

    room.updateRoomInfoPlayers(); // Broadcast to clients in the room

    // Broadcast to clients in the lobby
    broadcastRoomsListToLobby();
    broadcastLobbyUsersList(ws);
  } catch (error) {
    console.log("Create room failed.", error);
  }
};

const joinRoom = (data, ws) => {
  const { roomId } = data;
  const player = { user: ws.session.user, ws };

  const room = rooms[roomId];

  if (room.joinRoom(player)) {
    ws.session.room = room;
    ws.send(
      // Response to joiner client
      JSON.stringify({
        type: "joinRoomResponse",
        content: { success: true, message: "Join room success.", data: { room: room.getRoomData() } },
      })
    );

    room.updateRoomInfoPlayers(); // Broadcast to clients in the room

    // Broadcast to clients in the lobby
    broadcastRoomsListToLobby();
    broadcastLobbyUsersList(ws);
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
  const { roomId } = data;
  const player = { user: ws.session.user };
  const room = rooms[roomId];

  if (room.leaveRoom(player)) {
    ws.session.room = null;
    ws.send(
      JSON.stringify({
        type: "leaveRoomResponse",
        content: { success: true, message: "Leave room success.", data: { room: room.getRoomData() } },
      })
    );

    if (room.players.length === 0) {
      delete rooms[roomId];
    }

    room.updateRoomInfoPlayers(); // Broadcast to clients in the room

    // Broadcast to clients in the lobby
    broadcastRoomsListToLobby();
    broadcastLobbyUsersList(ws);
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

const toggleReadyPlayer = (data, ws) => {
  const { roomId } = data;
  const player = { user: ws.session.user };
  const room = rooms[roomId];

  if (room.toggleReadyPlayer(player)) {
    ws.send(
      JSON.stringify({
        type: "readyPlayerResponse",
        content: { success: true, message: "Toggle ready player success.", data: {} },
      })
    );

    room.updateRoomInfoPlayers(); // Broadcast to clients in the room

    if (room.checkAllPlayersReady()) {
      room.startGame();
    }
  } else {
    console.log("Toggle ready player failed.", error);
    ws.send(
      JSON.stringify({
        type: "toggleReadyPlayerResponse",
        content: { success: false, message: "Toggle player failed.", data: null },
      })
    );
  }
};

export const getAllRooms = () => {
  return Object.values(rooms).map((room) => room.getRoomDataForList());
};

// For a single client
export const sendRoomsList = (data, ws) => {
  try {
    const roomsList = Object.values(rooms).map((room) => room.getRoomDataForList());
    if (roomsList.length > 0) {
      ws.send(
        JSON.stringify({
          type: "updateRoomsList",
          content: { success: true, message: "Rooms list (single client).", data: { rooms: roomsList } },
        })
      );
    }
  } catch (error) {
    console.log("Send rooms list failed.", error);
  }
};

// For all clients
const broadcastRoomsListToLobby = async () => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user && !clientWs.session.room) {
        const roomsList = getAllRooms();
        clientWs.send(
          JSON.stringify({
            type: "updateRoomsList",
            content: { success: true, message: "Rooms list (all clients in the lobby).", data: { rooms: roomsList } },
          })
        );
      }
    });
  } catch (error) {
    console.log("Update rooms list failed.", error);
  }
};
export default roomsManager;
