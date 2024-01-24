import { isValidSession } from "../middleware/authMiddleware.js";
import { broadcastUsersList } from "./notifyAll.js";
import { sendRoomsList } from "./roomsManager.js";
import { User } from "../models/userModel.js";

const authHandler = (content, ws) => {
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

    broadcastUsersList();
    sendRoomsList(ws);
  } catch (error) {
    console.log("Login failed.", error);
  }
};

const handleLogout = (data, ws) => {
  try {
    ws.session = null;

    broadcastUsersList();
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
      ws.session = null;

      await User.findByIdAndUpdate(user._id, { isActive: false });
      broadcastUsersList();

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

export default authHandler;
