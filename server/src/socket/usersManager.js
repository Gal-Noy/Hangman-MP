import { User } from "../models/userModel.js";
import { clients } from "./socketListener.js";
import { getAllRooms } from "./roomsManager.js";

const usersManager = (content, ws) => {
  const { action, data } = content;

  console.log("INCOMING USERS MANAGER", action, data, ws.session.user.name);

  const handler = {
    list: sendLobbyUsersList,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

// For a single client
const sendLobbyUsersList = async (data, ws) => {
  try {
    const roomsList = getAllRooms();

    if (ws.session && ws.session.user) {
      const currentUser = ws.session.user;
      const users = await User.find({ $and: [{ _id: { $ne: currentUser._id } }, { isActive: true }] }).exec();
      // users.filter((user) => !roomsList.some((room) => room.players.some((player) => player.id === user._id)));
      ws.send(
        JSON.stringify({
          type: "updateLobbyUsersList",
          content: { success: true, message: "Lobby users list (single client).", data: { users } },
        })
      );
    }
  } catch (error) {
    console.log("Update users list failed.", error);
  }
};

// For all clients
export const broadcastLobbyUsersList = async () => {
  try {
    const roomsList = getAllRooms();

    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user) {
        const currentUser = clientWs.session.user;
        const users = await User.find({ $and: [{ _id: { $ne: currentUser._id } }, { isActive: true }] }).exec();
        // users.filter((user) => !roomsList.some((room) => room.players.some((player) => player.id === user._id)));
        clientWs.send(
          JSON.stringify({
            type: "updateLobbyUsersList",
            content: { success: true, message: "Lobby users list (all clients).", data: { users } },
          })
        );
      }
    });
  } catch (error) {
    console.log("Update users list failed.", error);
  }
};

export default usersManager;
