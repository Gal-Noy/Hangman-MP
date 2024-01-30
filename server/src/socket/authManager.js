import { isValidSession } from "../middleware/authMiddleware.js";
import { broadcastUsersList } from "./usersManager.js";
import { sendRoomsList } from "./roomsManager.js";
import { User } from "../models/userModel.js";
import { leaveRoom } from "./roomsManager.js";

const authManager = (content, ws) => {
  const { action, data } = content;

  const handler = {
    login: handleLogin,
    logout: handleLogout,
    reAuth: handleReAuth,
  }[action];

  if (handler) {
    handler(data, ws);
  }
};

const handleLogin = (data, ws) => {
  try {
    const user = JSON.parse(data.user);
    const token = data.token;

    ws.session = { user, token };

    broadcastUsersList([ws]);
    sendRoomsList({}, ws);
  } catch (error) {
    console.log("Login failed.", error);
  }
};

const handleLogout = async (data, ws) => {
  try {
    if (ws.session?.room) {
      await leaveRoom({ logout: true }, ws);
    } else {
      broadcastUsersList([ws]);
    }
    ws.session = null;
  } catch (error) {
    console.log("Logout failed.", error);
  }
};

const handleReAuth = async (data, ws) => {
  try {
    const user = JSON.parse(data.user);
    const token = data.token;

    if (isValidSession(user, token)) {
      ws.session = {
        user,
        token,
      };
    } else {
      // Logout routine
      await User.findByIdAndUpdate(user._id, { isActive: false, inRoom: false, inGame: false });
      handleLogout(data, ws);

      ws.send(
        JSON.stringify({
          type: "reAuthResponse",
          content: { success: false, message: "Re-auth failed.", data: {} },
        })
      );
    }
  } catch (error) {
    console.log("Re-auth failed.", error);
  }
};

export default authManager;
