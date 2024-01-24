import Dashboard from "../components/Dashboard/Dashboard";
import { useSelector } from "react-redux";
import Lobby from "./Lobby";

function HomePage({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);

  return (
    <div className="bg-secondary vh-100 d-flex flex-column justify-content-center align-items-center">
      <Dashboard onLogout={onLogout} />
      {clientState === "lobby" && <Lobby />}
      {/* {clientState === 'room' && <Room /> }
      {clientState === 'game' && <Game /> } */}
    </div>
  );
}

export default HomePage;
