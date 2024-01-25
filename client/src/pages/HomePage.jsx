import Dashboard from "../components/Dashboard/Dashboard";
import { useSelector } from "react-redux";
import Lobby from "./Lobby";
import Room from "./Room";
import { useEffect } from "react";
import { useWebSocketContext } from "../WebSocketContext";

function HomePage({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const { lastJsonMessage } = useWebSocketContext();

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      console.log(type, content);
    }
  }, [lastJsonMessage]);
  return (
    <div className="bg-secondary vh-100 d-flex flex-column justify-content-center align-items-center">
      <Dashboard onLogout={onLogout} />
      {clientState === "lobby" && <Lobby />}
      {clientState === "room" && <Room />}
      {/* {clientState === 'game' && <Game /> } */}
    </div>
  );
}

export default HomePage;
