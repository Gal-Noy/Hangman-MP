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
  const [gameMessage, setGameMessage] = useState({
    type: "", // success, error, info
    message: "",
  });

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      const { data } = content;
      switch (type) {
        case "gameStateUpdate":
          dispatch(setGameState(data));
          break;
        case "timerUpdate":
          if (timer < 0) {
            setGameMessage({ type: "info", message: "Game Started!" });
          }
          setTimer(data);
          if (cooldown >= 0) setCooldown(-1);
          break;
        case "cooldownUpdate":
          setCooldown(data);
          if (timer >= 0) setTimer(-1);
          break;
        case "guessResponse":
          const { success, message } = data;
          setGameMessage({ type: success ? "success" : "error", message });
          break;
        case "endOfRound":
          setGameMessage({ type: "info", message: data });
          break;
        case "gameOver":
          setGameMessage({ type: "info", message: data });
          break;
        default:
          break;
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (cooldown >= 0 && timer < 0) {
      setGameMessage({ type: "info", message: `Get Ready! Game will start in ${cooldown} seconds` });
    }
  }, [cooldown, timer]);

  return (
    gameState && (
      <div className="game-container">
        <GameInfo gameState={gameState} />
        <GamePanel
          gameName={roomData.name}
          gameState={gameState}
          timer={timer}
          cooldown={cooldown}
          gameMessage={gameMessage}
        />
      </div>
    )
  );
}

export default Game;
