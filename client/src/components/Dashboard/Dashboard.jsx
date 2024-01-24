import Logout from "./Logout";
import { useSelector } from "react-redux";

function Dashboard({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white mb-1 p-3 rounded w-75">
      {user && (
        <div className="text-center">
          <div>
            Hello <strong>{user.name}</strong>, welcome to chat!
          </div>
          {clientState === "lobby" && <div>Lobby</div>}
          {/* {clientState === "room" && <div>Click on a user to invite them to a game.</div>}
          {clientState === "game" && <div>Play the game!</div>} */}
        </div>
      )}
      <Logout onLogout={onLogout} />
    </div>
  );
}

export default Dashboard;
