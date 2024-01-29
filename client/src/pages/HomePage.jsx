import Dashboard from "../components/Dashboard/Dashboard";
import { useSelector } from "react-redux";
import Lobby from "./Lobby";
import Room from "./Room";

function HomePage({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);

  return (
    <div className="bg-secondary vh-100 d-flex flex-column justify-content-center align-items-center">
      <Dashboard onLogout={onLogout} />
      {clientState === "lobby" && <Lobby />}
      {clientState === "room" && <Room />}
      {/* {clientState === 'game' && <Game players={roomData.players} /> } */}
    </div>
  );
}

export default HomePage;
