import LogoutBtn from "./LogoutBtn";
import BackToLobbyBtn from "./BackToLobbyBtn";
import ReadyBtn from "./ReadyBtn";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import "../../styles/Dashboard.scss";

function Dashboard({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);
  const gameState = useSelector((state) => state.clientState.gameState);
  const user = JSON.parse(localStorage.getItem("user"));
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

  return (
    <div className="bg-white mb-2 p-3 rounded w-75">
      {user && (
        <div className="text-center">
          {clientState !== "lobby" && (
            <div className="mb-3">
              <strong>{roomData.name}</strong>
            </div>
          )}
          {clientState === "game" && gameState && (
            <div>
              <div className="mb-3 game-data">
                Round: {gameState.round} | Score: {gameState.score} | Remaining Wrong Attempts:{" "}
                {gameState.remainingWrongAttempts}
              </div>
              {timer > 0 && cooldown < 0 && (
                <div className="mb-3">
                  <strong>Time Remaining: {timer}</strong>
                </div>
              )}
              {cooldown > 0 && timer < 0 && (
                <div className="mb-3">
                  <strong>Get Ready: {cooldown}</strong>
                </div>
              )}
              {alert && (
                <div className="alert alert-warning w-50 mx-auto" role="alert">
                  {alert}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="d-flex justify-content-between">
        <LogoutBtn onLogout={onLogout} />
        {clientState === "room" && <ReadyBtn />}
        {clientState !== "lobby" && <BackToLobbyBtn />}
      </div>
    </div>
  );
}

export default Dashboard;
