import LogoutBtn from "./LogoutBtn";
import BackToLobbyBtn from "./BackToLobbyBtn";
import ReadyBtn from "./ReadyBtn";
import { useSelector } from "react-redux";

function Dashboard({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);
  const gameState = useSelector((state) => state.clientState.gameState);
  const user = JSON.parse(localStorage.getItem("user"));

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
              <div className="round-data">
                Round: {gameState.round} | Score: {gameState.score} | Remaining Wrong Attempts:{" "}
                {gameState.remainingWrongAttempts}
              </div>
              <div className="round-timer">
                {gameState.timer > -1 && (
                  <div>
                    <strong>Time Remaining: {gameState.timer}</strong>
                  </div>
                )}
              </div>
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
