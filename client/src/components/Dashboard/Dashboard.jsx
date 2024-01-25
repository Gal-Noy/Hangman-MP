import LogoutBtn from "./LogoutBtn";
import BackToLobbyBtn from "./BackToLobbyBtn";
import ReadyBtn from "./ReadyBtn";
import { useSelector } from "react-redux";

function Dashboard({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);
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
          {clientState === "room" && (
            <div>
              <strong>{roomData.name}</strong>
            </div>
          )}
        </div>
      )}
      <div className="d-flex flex-row ">
        <LogoutBtn onLogout={onLogout} />
        {clientState === "room" && <ReadyBtn roomId={roomData.id} />}
        {clientState !== "lobby" && <BackToLobbyBtn roomId={roomData.id} />}
      </div>
    </div>
  );
}

export default Dashboard;
