import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { useWebSocketContext } from "../../WebSocketContext";
import { useDispatch } from "react-redux";
import { setLobby } from "../../store/clientStateSlice";

function LogoutBtn({ onLogout }) {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          dispatch(setLobby());

          // Send logout message to websocket server
          sendJsonMessage({
            type: "auth",
            content: {
              action: "logout",
            },
          });

          alert(res.data.msg);
          onLogout();
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err.message);
        alert(err.response.data.msg);
      });
  };

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "reAuthResponse") {
        const { success, message } = content;
        if (!success) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          dispatch(setLobby());
          alert(message);
          onLogout();
          navigate("/login");
        }
      }
    }
  }, [lastJsonMessage]);

  return (
    <button className="btn btn-danger mt-3" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutBtn;
