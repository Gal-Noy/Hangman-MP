import React from "react";
import zeroStrikes from "../../assets/1.png";
import oneStrike from "../../assets/2.png";
import twoStrikes from "../../assets/3.png";
import threeStrikes from "../../assets/4.png";
import fourStrikes from "../../assets/5.png";
import fiveStrikes from "../../assets/6.png";

function HangmanCanvas({ remainingWrongAttempts }) {
  return (
    <div className="hangman-canvas">
      {remainingWrongAttempts === 5 ? (
        <img src={zeroStrikes} alt="0 strikes" />
      ) : remainingWrongAttempts === 4 ? (
        <img src={oneStrike} alt="1 strike" />
      ) : remainingWrongAttempts === 3 ? (
        <img src={twoStrikes} alt="2 strikes" />
      ) : remainingWrongAttempts === 2 ? (
        <img src={threeStrikes} alt="3 strikes" />
      ) : remainingWrongAttempts === 1 ? (
        <img src={fourStrikes} alt="4 strikes" />
      ) : remainingWrongAttempts === 0 ? (
        <img src={fiveStrikes} alt="5 strikes" />
      ) : null}
    </div>
  );
}

export default HangmanCanvas;
