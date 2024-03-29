import Room from "../classes/Room.js";
import { User } from "../models/userModel.js";
import { clients } from "./socketListener.js";
import { broadcastUsersList } from "./usersManager.js";
import { broadcastLogToRoomChat } from "./chatsManager.js";

export const rooms = {};

const roomsManager = (content, ws) => {
  const { action, data } = content;

  const handler = {
    list: sendRoomsList,
    create: createRoom,
    join: joinRoom,
    leave: leaveRoom,
    invite: invitePlayer,
    kick: kickPlayer,
    modify: modifyRoom,
    ready: toggleReadyPlayer,
    unready: toggleReadyPlayer,
    return: returnPlayerToRoom,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

const createRoom = async (data, ws) => {
  try {
    const { name, numberOfPlayers, password, gameRules } = data;

    if (name === "") {
      ws.send(
        JSON.stringify({
          type: "createRoomResponse",
          content: { success: false, message: "Room name cannot be empty.", data: null },
        })
      );
      return;
    }

    const players = [{ user: ws.session.user, ws }]; // Join the creator to the room

    const room = new Room(name, players, numberOfPlayers, password, gameRules);
    rooms[room.id] = room;

    await User.updateMany({ _id: { $in: players.map((player) => player.user._id) } }, { inRoom: true }).exec();
    ws.session.room = room;

    ws.send(
      // Response to creator client
      JSON.stringify({
        type: "createRoomResponse",
        content: { success: true, message: "Create room success.", data: { room: room.getRoomData() } },
      })
    );

    room.updateRoomInfoPlayers();
    broadcastLogToRoomChat(room, "create", `${ws.session.user.name.toUpperCase()} created the room '${room.name}'.`);

    broadcastRoomsListToLobby([ws]);
    broadcastUsersList([ws]);
  } catch (error) {
    console.log("Create room failed.", error);
  }
};

const joinRoom = async (data, ws) => {
  const { roomId, password } = data;
  const user = ws.session.user;
  const player = { user, ws };
  const room = rooms[roomId];

  const error = room.joinRoom(player, password);
  if (error === "") {
    await User.findByIdAndUpdate(user._id, { inRoom: true }).exec();
    ws.session.room = room;

    ws.send(
      // Response to joiner client
      JSON.stringify({
        type: "joinRoomResponse",
        content: { success: true, message: "Join room success.", data: { room: room.getRoomData() } },
      })
    );

    room.updateRoomInfoPlayers();
    broadcastLogToRoomChat(room, "info", `${user.name.toUpperCase()} joined the room.`);

    broadcastRoomsListToLobby([ws]);
    broadcastUsersList([ws]);
  } else {
    ws.send(
      JSON.stringify({
        type: "joinRoomResponse",
        content: { success: false, message: error, data: { room: room.getRoomData() } },
      })
    );
  }
};

export const leaveRoom = async (data, ws) => {
  const room = ws.session.room;
  const user = ws.session.user;
  const player = { user };

  if (room.leaveRoom(player)) {
    await User.findByIdAndUpdate(user._id, { inRoom: false, inGame: false }).exec();
    ws.session.room = null;

    ws.send(
      JSON.stringify({
        type: "leaveRoomResponse",
        content: { success: true, message: "Leave room success.", data: { room: room.getRoomData() } },
      })
    );

    if (room.players.length === 0) {
      delete rooms[room.id];
    }

    if (!room.game) {
      room.updateRoomInfoPlayers();
      broadcastLogToRoomChat(room, "info", `${user.name.toUpperCase()} left the room.`);
    } else {
      room.game.removePlayer(player);
    }

    broadcastRoomsListToLobby([ws]);
    if (!data.logout) {
      broadcastUsersList([ws]);
    }
  } else {
    console.log("Leave room failed.");
    ws.send(
      JSON.stringify({
        type: "leaveRoomResponse",
        content: { success: false, message: "Leave room failed.", data: null },
      })
    );
  }
};

const invitePlayer = (data, ws) => {
  const { invitedPlayerId, password } = data;
  const room = ws.session.room;

  const invitedPlayerWs = Object.values(clients).find((client) => client.session?.user._id === invitedPlayerId);

  if (invitedPlayerWs) {
    invitedPlayerWs.send(
      JSON.stringify({
        type: "inviteToRoom",
        content: {
          success: true,
          message: "Invite player.",
          data: { inviter: ws.session.user.name, room: room.getRoomData(), password },
        },
      })
    );
  } else {
    console.log("Invite player failed.");
    ws.send(
      JSON.stringify({
        type: "invitePlayerResponse",
        content: { success: false, message: "Invite player failed.", data: null },
      })
    );
  }
};

const kickPlayer = async (data, ws) => {
  const { kickedPlayerId } = data;
  const room = ws.session.room;

  const kickedPlayerWs = Object.values(clients).find((client) => client.session?.user._id === kickedPlayerId);

  if (kickedPlayerWs && room.kickPlayer(ws.session.user, kickedPlayerId)) {
    await User.findByIdAndUpdate(kickedPlayerId, { inRoom: false, inGame: false }).exec();
    kickedPlayerWs.session.room = null;

    kickedPlayerWs.send(
      JSON.stringify({
        type: "kickFromRoom",
        content: { success: true, message: "Kick player.", data: { room: room.getRoomData() } },
      })
    );

    room.updateRoomInfoPlayers();
    broadcastLogToRoomChat(room, "info", `${kickedPlayerWs.session.user.name.toUpperCase()} was kicked from the room.`);

    broadcastRoomsListToLobby([ws, kickedPlayerWs]);
    broadcastUsersList([kickedPlayerWs]);
  } else {
    console.log("Kick player failed.");
    ws.send(
      JSON.stringify({
        type: "kickPlayerResponse",
        content: { success: false, message: "Kick player failed.", data: null },
      })
    );
  }
};

const modifyRoom = (data, ws) => {
  const room = ws.session.room;
  const { newName, newNumberOfPlayers, newGameRules, newPassword, isPrivate } = data;
  const modifyRoomLog = room.modifyRoom(newName, newNumberOfPlayers, newGameRules, newPassword, isPrivate);
  if (modifyRoomLog !== "No changes made.") {
    room.unreadyAllPlayers();
    room.updateRoomInfoPlayers();
    broadcastLogToRoomChat(room, "info", modifyRoomLog);

    broadcastRoomsListToLobby([ws]);
  } else {
    console.log("Modify room failed.");
    ws.send(
      JSON.stringify({
        type: "modifyRoomResponse",
        content: { success: false, message: "Modify room failed.", data: null },
      })
    );
  }
};

const toggleReadyPlayer = async (data, ws) => {
  const player = { user: ws.session.user };
  const room = ws.session.room;

  if (room.toggleReadyPlayer(player)) {
    ws.send(
      JSON.stringify({
        type: "readyPlayerResponse",
        content: { success: true, message: "Toggle ready player success.", data: {} },
      })
    );

    room.updateRoomInfoPlayers();

    if (room.checkAllPlayersReady()) {
      await User.updateMany({ _id: { $in: room.players.map((player) => player.user._id) } }, { inGame: true }).exec();
      room.updateRoomInfoPlayers();
      broadcastLogToRoomChat(room, "game-start", "All players are ready. Starting the game...");
      broadcastRoomsListToLobby(room.players.map((player) => player.ws));
      broadcastUsersList(room.players.map((player) => player.ws));
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

const returnPlayerToRoom = async (data, ws) => {
  const room = ws.session.room;
  const playerId = ws.session.user._id;

  if (room.returnPlayerToRoom(playerId)) {
    await User.findByIdAndUpdate(playerId, { inGame: false }).exec();

    ws.send(
      JSON.stringify({
        type: "returnToRoomResponse",
        content: { success: true, message: "Return to room success.", data: { room: room.getRoomData() } },
      })
    );

    room.updateRoomInfoPlayers();
    broadcastLogToRoomChat(room, "info", `${ws.session.user.name.toUpperCase()} returned to the room.`);

    broadcastRoomsListToLobby([ws]);
    broadcastUsersList([ws]);
  } else {
    console.log("Return to room failed.");
    ws.send(
      JSON.stringify({
        type: "returnToRoomResponse",
        content: { success: false, message: "Return to room failed.", data: null },
      })
    );
  }
};

export const getAllRooms = () => {
  return Object.values(rooms).map((room) => room.getRoomData());
};

// For a single client
export const sendRoomsList = (data, ws) => {
  try {
    const roomsList = Object.values(rooms).map((room) => room.getRoomData());
    if (roomsList.length > 0) {
      ws.send(
        JSON.stringify({
          type: "updateRoomsList",
          content: {
            success: true,
            message: "Rooms list (single client).",
            data: { rooms: roomsList },
          },
        })
      );
    }
  } catch (error) {
    console.log("Send rooms list failed.", error);
  }
};

// For all clients
export const broadcastRoomsListToLobby = async (exceptWs) => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (
        clientWs.session &&
        clientWs.session.user &&
        !clientWs.session.room &&
        !(exceptWs && exceptWs.some((ws) => ws === clientWs))
      ) {
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
