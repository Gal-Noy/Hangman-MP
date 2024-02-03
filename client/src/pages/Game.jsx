import React, { useState, useEffect } from "react";
import GameInfo from "../components/Game/GameInfo";
import GamePanel from "../components/Game/GamePanel";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setGameState, setRoom } from "../store/clientStateSlice";
import "../styles/Game.scss";

function Game() {
  const { lastJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();
  const { gameState, roomData } = useSelector((state) => state.clientState);
  const [timer, setTimer] = useState(60);
  const [cooldown, setCooldown] = useState(5);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      const { data } = content;
      switch (type) {
        case "gameStateUpdate":
          dispatch(setGameState(data));
          break;
        case "timerUpdate":
          setTimer(data);
          if (cooldown >= 0) setCooldown(-1);
          break;
        case "cooldownUpdate":
          setCooldown(data);
          if (timer >= 0) setTimer(-1);
          break;
        case "endOfRound":
          setAlert(data);
          break;
        case "gameOver":
          setAlert(data);
          dispatch(setRoom(roomData));
          break;
        default:
          break;
      }
    }
  }, [lastJsonMessage]);

  return (
    gameState && (
      <div className="game-container">
        <GameInfo gameState={gameState} />
        {/* <GamePanel /> */}
      </div>
    )
  );
}

export default Game;
