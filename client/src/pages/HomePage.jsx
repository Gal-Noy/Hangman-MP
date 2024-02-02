import Dashboard from "../components/Dashboard/Dashboard";
import { useSelector, useDispatch } from "react-redux";
import Lobby from "./Lobby";
import Room from "./Room";
import Game from "./Game";
import { useWebSocketContext } from "../WebSocketContext";
import { useEffect } from "react";
import { setGame } from "../store/clientStateSlice";
import "../styles/HomePage.scss";

function HomePage({ onLogout }) {
  const { clientState, roomData, lobbyState } = useSelector((state) => state.clientState);
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
    <div>
      <div className="hangman-div">
        <Dashboard onLogout={onLogout} />
        <div className="main-game-container">
          {clientState === "lobby" && <Lobby lobbyState={lobbyState} />}
          {clientState === "room" && <Room />}
        </div>
      </div>

      {/* {clientState === "game" && <Game players={roomData.players} />} */}
    </div>
  );
}

export default HomePage;
