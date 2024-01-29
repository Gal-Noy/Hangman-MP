import Dashboard from "../components/Dashboard/Dashboard";
import { useSelector, useDispatch } from "react-redux";
import Lobby from "./Lobby";
import Room from "./Room";
import Game from "./Game";
import { useWebSocketContext } from "../WebSocketContext";
import { useEffect } from "react";
import { setGame } from "../store/clientStateSlice";

function HomePage({ onLogout }) {
  const clientState = useSelector((state) => state.clientState.clientState);
  const roomData = useSelector((state) => state.clientState.roomData);
  const { lastJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "startGame") {
        dispatch(setGame());
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className="bg-secondary vh-100 d-flex flex-column justify-content-center align-items-center">
      <Dashboard onLogout={onLogout} />
      {clientState === "lobby" && <Lobby />}
      {clientState === "room" && <Room />}
      {clientState === "game" && <Game players={roomData.players} />}
    </div>
  );
}

export default HomePage;
