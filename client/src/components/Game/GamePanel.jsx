import React from "react";
import WordAndDefinition from "./WordAndDefinition";
import LettersPad from "./LettersPad";
import HangmanCanvas from "./HangmanCanvas";

function GamePanel(props) {
  const { gameName, gameState, timer, cooldown, gameMessage } = props;

  return (
    <div className="game-panel-container">
      <div className="game-panel-header">
        <div className="game-panel-header-left">
          <div className="game-panel-header-left-title">{gameName}</div>
          <div className="game-panel-header-left-timer">
            {timer > 0 && cooldown < 0 && (
              <span>
                Time Remaining: <strong>{timer}</strong> seconds
              </span>
            )}
          </div>
        </div>
        <div className="game-panel-header-right">
          <div className="game-panel-header-right-game-message">
            {gameMessage.type === "success" ? (
              <div id="game-message-success">{gameMessage.message}</div>
            ) : gameMessage.type === "error" ? (
              <div id="game-message-error">{gameMessage.message}</div>
            ) : (
              <div id="game-message-info">{gameMessage.message}</div>
            )}
          </div>
        </div>
      </div>
      <div className="game-panel-content">
        <div className="game-panel-content-left">
          <WordAndDefinition definition={gameState.definition} hiddenWord={gameState.hiddenWord} />
          <LettersPad keypadLetters={gameState.keypadLetters} usedLetters={gameState.usedLetters} />
        </div>
        <div className="game-panel-content-right">
          <HangmanCanvas remainingWrongAttempts={gameState.remainingWrongAttempts} />
        </div>
      </div>
    </div>
  );
}

export default GamePanel;
