import React, { useEffect } from "react";
import GamePlayersList from "../components/Game/GamePlayersList";
import GamePanel from "../components/Game/GamePanel";
import { useWebSocketContext } from "../WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setGameState, setRoom } from "../store/clientStateSlice";

function Game() {
  const { lastJsonMessage } = useWebSocketContext();
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.clientState.gameState);
  const roomData = useSelector((state) => state.clientState.roomData);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "gameStateUpdate") {
        dispatch(setGameState(content.data));
      } else if (type === "gameOver") {
        dispatch(setRoom(roomData));
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
