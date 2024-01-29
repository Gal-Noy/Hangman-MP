import React from "react";
import { useSelector } from "react-redux";
import WordAndDefinition from "./WordAndDefinition";
import LettersPad from "./LettersPad";
import HangmanCanvas from "./HangmanCanvas";

function GamePanel() {
  const gameState = useSelector((state) => state.clientState.gameState);

  return (
    <div className="d-flex bg-gray-400 rounded rounded-s w-75 ms-1">
        <div className=" d-flex flex-column w-70">
          <WordAndDefinition definition={gameState.definition} hiddenWord={gameState.hiddenWord} />
          <LettersPad keypadLetters={gameState.keypadLetters} usedLetters={gameState.usedLetters} />
        </div>
      <HangmanCanvas remainingWrongAttempts={gameState.remainingWrongAttempts} />
    </div>
  );
}

export default GamePanel;
