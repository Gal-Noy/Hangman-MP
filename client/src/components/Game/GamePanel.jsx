import React from "react";
import { useSelector } from "react-redux";
import WordAndDefinition from "./WordAndDefinition";
import LettersPad from "./LettersPad";

function GamePanel() {
  const gameState = useSelector((state) => state.clientState.gameState);

  return (
    <div className="bg-gray-400 rounded d-flex flex-column w-75 h-100 ms-1">
      <WordAndDefinition definition={gameState.definition} hiddenWord={gameState.hiddenWord} />
      <LettersPad keypadLetters={gameState.keypadLetters} usedLetters={gameState.usedLetters}/>
    </div>
  );
}

export default GamePanel;
