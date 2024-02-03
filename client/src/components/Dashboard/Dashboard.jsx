import LogoutBtn from "./LogoutBtn";
import BackToLobbyBtn from "./BackToLobbyBtn";
import ReadyBtn from "./ReadyBtn";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import "../../styles/Dashboard.scss";
import Logo from "../../assets/logo.png";
import defaultAvatar from "../../assets/default-avatar.jpg";
import { setLobbyChat, setLobbyRoomsList } from "../../store/clientStateSlice";
import { b64toBlob } from "../../utils/utils";

function Dashboard({ onLogout }) {
  const { clientState, lobbyState, roomData, gameState } = useSelector((state) => state.clientState);
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const userAvatar = !user?.avatar ? null : b64toBlob(user.avatar, "image/");
  const { lastJsonMessage } = useWebSocketContext();
  const [timer, setTimer] = useState(60);
  const [cooldown, setCooldown] = useState(5);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    if (lastJsonMessage) {
      const { type } = lastJsonMessage;
      if (type === "timerUpdate") {
        setTimer(lastJsonMessage.content.data);
        if (cooldown >= 0) setCooldown(-1);
      } else if (type === "cooldownUpdate") {
        setCooldown(lastJsonMessage.content.data);
        if (timer >= 0) setTimer(-1);
      } else if (type === "gameOver" || type === "endOfRound") {
        setAlert(lastJsonMessage.content.data);
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (alert) {
      setTimeout(() => {
        setAlert("");
      }, 3000);
    }
  }, [alert]);

  const setLobbyState = (clickedState) => {
    clickedState === "roomsList" ? dispatch(setLobbyRoomsList()) : dispatch(setLobbyChat());
  };

  return (
    <div className="dashboard-container">
      <img src={Logo} alt="logo" className="dashboard-logo" />
      <div className="dashboard-content">
        {clientState === "lobby" && (
          <div className="dashboard-menu-buttons">
            <button
              type="button"
              className={`dashboard-menu-button pheasant-demure-button outline light hover blink ${
                lobbyState === "roomsList" ? "active" : ""
              }`}
              id="lobby-roomsList-button"
              onClick={() => setLobbyState("roomsList")}
            >
              <span className="label">Rooms</span>
            </button>
            <button
              type="button"
              className={`dashboard-menu-button pheasant-demure-button outline light hover blink ${
                lobbyState === "chat" ? "active" : ""
              }`}
              id="lobby-chat-button"
              onClick={() => setLobbyState("chat")}
            >
              <span className="label">Chat</span>
            </button>
          </div>
        )}
        {clientState === "room" && (
          <div className="dashboard-menu-buttons">
            <ReadyBtn />
            <BackToLobbyBtn inGame={false} />
          </div>
        )}
        {clientState === "game" && (
          <div className="dashboard-menu-buttons">
            <BackToLobbyBtn inGame={true} />
          </div>
        )}
      </div>
      <div className="dashboard-user-section">
        <div className="dashboard-user-info">
          <img
            src={!userAvatar ? defaultAvatar : URL.createObjectURL(userAvatar)}
            alt="avatar"
            className="dashboard-user-info-avatar"
          />
          <span className="dashboard-user-info-name">{user.name.toUpperCase()}</span>
        </div>
        <LogoutBtn onLogout={onLogout} isDashboard={true} />
      </div>
    </div>
  );
}

export default Dashboard;
