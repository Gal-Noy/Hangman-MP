import React, { useEffect } from "react";
import GamePlayersList from "../components/Game/GamePlayersList";
import GamePanel from "../components/Game/GamePanel";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setGameState } from "../store/clientStateSlice";

function Game() {
  const { lastJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.clientState.gameState);

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.type === "gameStateUpdate") {
        dispatch(setGameState(lastJsonMessage.content.data));
      } else if (lastJsonMessage.type === "timerUpdate") {
        dispatch(setGameState({ ...gameState, timer: lastJsonMessage.content.data }));
      }
    }
  }, [lastJsonMessage]);

  return (
    gameState && (
      <div className="mb-1 w-75 d-flex flex-row">
        <GamePlayersList players={gameState.players} />
        <GamePanel />
      </div>
    )
  );
}

export default Game;
