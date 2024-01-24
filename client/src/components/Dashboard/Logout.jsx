import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { useWebSocketContext } from "../../WebSocketContext";

function Logout({ onLogout }) {
  const { lastMessage, sendJsonMessage, handleReceivedMessage } = useWebSocketContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.status === 200) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");

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
    handleReceivedMessage(
      lastMessage,
      "reAuthResponse",
      (content) => {
        const { success, message } = content;
        if (!success) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          alert(message);
          onLogout();
          navigate("/login");
        }
      },
      () => {}
    );
  }, [lastMessage]);

  return (
    <button className="btn btn-danger mt-3" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Logout;
