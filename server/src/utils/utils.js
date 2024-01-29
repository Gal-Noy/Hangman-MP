const mapNumberToCardName = (number) => {
  const suits = ["h", "d", "c", "s"];
  const values = {
    1: "2",
    2: "3",
    3: "4",
    4: "5",
    5: "6",
    6: "7",
    7: "8",
    8: "9",
    9: "10",
    10: "jack",
    11: "queen",
    12: "king",
    13: "ace",
  };

  if (number >= 1 && number <= 52) {
    const suitIndex = Math.floor((number - 1) / 13);
    const cardNumber = ((number - 1) % 13) + 1;
    const cardName = values[cardNumber] + "_" + suits[suitIndex] + ".png";
    return cardName;
  } else if (number === 53) {
    return "joker_black.png";
  } else if (number === 54) {
    return "joker_red.png";
  } else {
    return "invalid.png";
  }
};

export { mapNumberToCardName };
