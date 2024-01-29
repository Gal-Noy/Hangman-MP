import React from "react";
import { useWebSocketContext } from "../../WebSocketContext";

function LettersPad(props) {
  const { keypadLetters, usedLetters } = props;
  const { sendJsonMessage } = useWebSocketContext();

  const handleLetterClick = (letter) => {
    sendJsonMessage({
      type: "guessLetter",
      content: {
        data: letter,
      },
    });
  };

  return (
    <div className="rounded bg-light mx-2 mb-2 h-50 w-60 overflow-auto">
      <div className="rounded bg-light m-4">
        {keypadLetters.map((letter, index) => (
          <button
            key={index}
            className={
              "letter-button me-1 my-1 ms-2 fs-5 btn" +
              (usedLetters.includes(letter) ? " btn-dark disabled" : " btn-outline-dark")
            }
            onClick={() => handleLetterClick(letter.toLowerCase())}
            style={{ width: "60px", height: "60px" }}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LettersPad;
