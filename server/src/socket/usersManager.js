import { User } from "../models/userModel.js";
import { clients } from "./socketListener.js";

const usersManager = (content, ws) => {
  const { action, data } = content;

  const handler = {
    list: sendUsersList,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

// For a single client
const sendUsersList = async (data, ws) => {
  try {
    if (ws.session && ws.session.user) {
      const users = await User.find({ _id: { $ne: ws.session.user._id } }).exec();
      users.map((user) => (user.password = null));

      ws.send(
        JSON.stringify({
          type: "updateUsersList",
          content: { success: true, message: "Users list (single client).", data: { users } },
        })
      );
    }
  } catch (error) {
    console.log("Update users list failed.", error);
  }
};

// For all clients
export const broadcastUsersList = async (exceptWs) => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user && !(exceptWs && exceptWs.some((ws) => ws === clientWs))) {
        const users = await User.find({ _id: { $ne: ws.session.user._id } }).exec();
        users.map((user) => (user.password = null));

        clientWs.send(
          JSON.stringify({
            type: "updateUsersList",
            content: { success: true, message: "Users list (all clients).", data: { users } },
          })
        );
      }
    });
  } catch (error) {
    console.log("Update users list failed.", error);
  }
};

export default usersManager;
