import { User } from "../models/userModel.js";
import { clients } from "./socketListener.js";

const usersManager = (content, ws) => {
  const { action, data } = content;

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
    if (ws.session && ws.session.user) {
      const currentUser = ws.session.user;
      const users = await User.find({
        $and: [{ _id: { $ne: currentUser._id } }, { isActive: true }, { inRoom: false }, { inGame: false }],
      }).exec();
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
export const broadcastLobbyUsersList = async (exceptWs) => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user && clientWs !== exceptWs) {
        const currentUser = clientWs.session.user;
        const users = await User.find({
          $and: [{ _id: { $ne: currentUser._id } }, { isActive: true }, { inRoom: false }, { inGame: false }],
        }).exec();
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
