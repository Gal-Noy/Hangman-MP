import React from "react";
import GamePlayersList from "../components/Game/GamePlayersList";

function Game({ players }) {
  return (
    <div className=" mb-1 w-75 d-flex flex-row">
      <GamePlayersList players={players} />
    </div>
  );
}

export default Game;
