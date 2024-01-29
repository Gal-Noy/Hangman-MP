export default class Table {
  constructor() {
    this.deck = [...Array(54).keys()];
    this.pile = [];
    this.playersHands = {}; // mapping players to their hands, while hands is an array of cards with the feature "revealed" or "hidden"
  }

  shuffleDeck() {
    this.deck.sort(() => Math.random() - 0.5);
  }

  revealCardToPlayer(playerId, cardIndex) {
    this.playersHands[playerId][cardIndex].revealed = true;
  }
}
