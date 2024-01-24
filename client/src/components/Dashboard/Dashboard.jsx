import Logout from "./Logout";
import BackToLobby from "./BackToLobby";
import { useSelector } from "react-redux";

function Dashboard({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white mb-1 p-3 rounded w-75">
      {user && (
        <div className="text-center">
          <div>
            Hello <strong>{user.name}</strong>, welcome to chat!
          </div>
          {clientState === "lobby" && <div>Lobby</div>}
          {clientState === "room" && (
            <div>
              <strong>{roomData.name}</strong>
            </div>
          )}
        </div>
      )}
      <Logout onLogout={onLogout} />
      {clientState !== "lobby" && <BackToLobby roomId={roomData.id} />}
    </div>
  );
}

export default Dashboard;
