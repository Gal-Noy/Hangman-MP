import React from "react";
import { useWebSocketContext } from "../../WebSocketContext";

function LettersPad(props) {
  const { keypadLetters, usedLetters } = props;
  const { sendJsonMessage } = useWebSocketContext();

  const handleLetterClick = (letter) => {
    sendJsonMessage({
      type: "game",
      content:{
        action: "guessLetter",
        data: letter,
      },
    });
  };

  return (
    <div className="letters-pad">
      {keypadLetters &&
        usedLetters &&
        keypadLetters.map((letter, index) => (
          <button
            key={index}
            className={`letters-pad-button ${usedLetters.includes(letter) ? "disabled" : ""}`}
            onClick={() => handleLetterClick(letter.toLowerCase())}
          >
            {letter.toUpperCase()}
          </button>
        ))}
    </div>
  );
}

export default LettersPad;
