import { User } from "../models/userModel.js";
import { clients } from "./socketListener.js";
import { getAllRooms } from "./roomsManager.js";

const broadcastUsersList = async () => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user) {
        const currentUser = clientWs.session.user;
        const users = await User.find({ _id: { $ne: currentUser._id } });
        clientWs.send(
          JSON.stringify({
            type: "updateUsersList",
            content: { success: true, message: "Users list.", data: { users } },
          })
        );
      }
    });
  } catch (error) {
    console.log("Update users list failed.", error);
  }
};

const broadcastRoomsList = async () => {
  try {
    Object.values(clients).forEach(async (clientWs) => {
      if (clientWs.session && clientWs.session.user) {
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

export { broadcastUsersList, broadcastRoomsList };
