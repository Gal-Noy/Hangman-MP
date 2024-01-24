import { User } from "../models/userModel.js";
import { clients } from "./socketListener.js";
import { getAllRooms } from "./roomsManager.js";

const broadcastLobbyUsersList = async () => {
  try {
    const roomsList = getAllRooms();

    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user) {
        const currentUser = clientWs.session.user;
        const users = await User.find({ _id: { $ne: currentUser._id } }).exec();
        // users.filter((user) => !roomsList.some((room) => room.players.some((player) => player.user._id === user._id)));
        clientWs.send(
          JSON.stringify({
            type: "updateLobbyUsersList",
            content: { success: true, message: "Lobby users list.", data: { users } },
          })
        );
      }
    });
  } catch (error) {
    console.log("Update users list failed.", error);
  }
};

const broadcastRoomsListToLobby = async () => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user && !clientWs.session.room) {
        const roomsList = getAllRooms();
        clientWs.send(
          JSON.stringify({
            type: "updateRoomsList",
            content: { success: true, message: "Rooms list.", data: { rooms: roomsList } },
          })
        );
      }
    });
  } catch (error) {
    console.log("Update rooms list failed.", error);
  }
};

export { broadcastLobbyUsersList, broadcastRoomsListToLobby };
