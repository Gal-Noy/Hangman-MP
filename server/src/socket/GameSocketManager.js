// const gameManager = (content, ws) => { // For incoming messages from clients
//   const { action, data } = content;

//   console.log("INCOMING GAME MANAGER", action, data, ws.session?.user.name);

//   const handler = {
//     list: sendGamesList,
//   }[action];

//   if (handler) {
//     handler(data, ws);
//   }
// };

// const createGame = async (data, ws) => {
//   try {
//     const { name, numberOfPlayers, password } = data;

//     if (name === "") {
//       ws.send(
//         JSON.stringify({
//           type: "createRoomResponse",
//           content: { success: false, message: "Room name cannot be empty.", data: null },
//         })
//       );
//       return;
//     }

//     const players = [{ user: ws.session.user, ws }]; // Join the creator to the room

//     const room = new Room(name, players, numberOfPlayers, password);
//     rooms[room.id] = room;

//     await User.updateMany({ _id: { $in: players.map((player) => player.user._id) } }, { inRoom: true }).exec();
//     ws.session.room = room;

//     ws.send(
//       // Response to creator client
//       JSON.stringify({
//         type: "createRoomResponse",
//         content: { success: true, message: "Create room success.", data: { room: room.getRoomData() } },
//       })
//     );

//     room.updateRoomInfoPlayers(); // Broadcast to clients in the room

//     // Broadcast to clients in the lobby
//     broadcastRoomsListToLobby(ws);
//     broadcastLobbyUsersList(ws);
//   } catch (error) {
//     console.log("Create room failed.", error);
//   }
// };

// export const leaveRoom = async (data, ws) => {
//   const { roomId } = data;
//   const user = ws.session.user;
//   const player = { user };
//   const room = rooms[roomId];

//   if (room.leaveRoom(player)) {
//     await User.findByIdAndUpdate(user._id, { inRoom: false }).exec();
//     ws.session.room = null;

//     ws.send(
//       JSON.stringify({
//         type: "leaveRoomResponse",
//         content: { success: true, message: "Leave room success.", data: { room: room.getRoomData() } },
//       })
//     );

//     if (room.players.length === 0) {
//       delete rooms[roomId];
//     }

//     room.updateRoomInfoPlayers(); // Broadcast to clients in the room

//     // Broadcast to clients in the lobby
//     broadcastRoomsListToLobby(ws);
//     if (!data.logout) {
//       broadcastLobbyUsersList(ws);
//     }
//   } else {
//     console.log("Leave room failed.");
//     ws.send(
//       JSON.stringify({
//         type: "leaveRoomResponse",
//         content: { success: false, message: "Leave room failed.", data: null },
//       })
//     );
//   }
// };

// export default gamesManager;

export class GameSocketManager {
  constructor(game, playersIdToWs) {
    this.game = game;
    this.playersIdToWs = playersIdToWs;
  }

  waitForPlayerAction(playerId) {
    return new Promise((resolve) => {
      this.playersIdToWs[playerId].on("message", function message(data, isBinary) {
        const message = isBinary ? data : JSON.parse(data);
        const { type, content } = message;
        if (type === "gameTurnAction") {
          resolve(content);
        }
      });
    });
  }
}
