import LogoutBtn from "./LogoutBtn";
import BackToLobbyBtn from "./BackToLobbyBtn";
import ReadyBtn from "./ReadyBtn";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";

function Dashboard({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);
  const gameState = useSelector((state) => state.clientState.gameState);
  const user = JSON.parse(localStorage.getItem("user"));
  const { lastJsonMessage } = useWebSocketContext();
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.type === "timerUpdate") {
      setTimer(lastJsonMessage.content.data);
    }
  }, [lastJsonMessage]);

  return (
    <div className="bg-white mb-1 p-3 rounded w-75">
      {user && (
        <div className="text-center">
          {clientState === "lobby" && (
            <div>
              Hello <strong>{user.name}</strong>, welcome to Guess The Words!
            </div>
          )}
          {clientState !== "lobby" && (
            <div>
              <strong>{roomData.name}</strong>
            </div>
          )}
          {clientState === "game" && gameState && (
            <div>
              <div className="game-data">
                Round: {gameState.round} | Score: {gameState.score} | Remaining Wrong Attempts:{" "}
                {gameState.remainingWrongAttempts}
              </div>
              {timer >= 0 && (
                <div>
                  <strong>Time Remaining: {timer}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="d-flex flex-row justify-content-between">
        <LogoutBtn onLogout={onLogout} />
        {clientState === "room" && <ReadyBtn />}
        {clientState !== "lobby" && <BackToLobbyBtn />}
      </div>
    </div>
  );
}

export default Dashboard;
