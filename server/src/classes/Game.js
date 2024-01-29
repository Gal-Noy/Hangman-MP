import Player from "./Player.js";
import Table from "./Table.js";
import { GameSocketManager } from "../socket/GameSocketManager.js";

export default class Game {
  constructor(room) {
    this.room = room;
    this.gameSocketManager = new GameSocketManager(
      this,
      room.players.reduce((acc, player) => {
        acc[player.user._id] = player.ws;
        return acc;
      }, {})
    );

    this.terminate = false;
    this.table = new Table();

    this.players = room.players
      .map((player) => new Player(player.user, player.ws, this, this.table))
      .sort(() => Math.random() - 0.5);

    this.players.forEach((player) => (player.ws.session.game = this));

    this.playersScores = {};

    this.currTurnIndex = null;
    this.turnTimer = null;
  }

  runGame() {
    // Shuffle the deck
    this.table.shuffleDeck();

    // Deal the cards, 4 cards per player
    this.dealCards();

    // Show each player 2 bottom cards
    this.revealStartingCards();

    // Set the first player
    this.currTurnIndex = 0;
    this.players[this.currTurnIndex].isTurn = true;

    // Start the turn timer
    // this.startTurnTimer();

    while (!this.terminate) {
      this.nextTurn();
    }

    this.announceWinner();

    this.endGame();
  }

  dealCards() {
    this.players.forEach((player) => {
      const cards = this.table.deck.splice(0, 4);
      player.hand = cards.map((card) => ({ card, revealed: false }));
      this.table.playersHands[player.user._id] = player.hand;

      // Broadcast to the player
    });
  }

  revealStartingCards() {
    this.players.forEach((player) => {
      player.hand[0].revealed = true;
      player.hand[1].revealed = true;
      this.table.playersHands[player.user._id] = player.hand;

      // Broadcast to the player

      setTimeout(() => {
        player.hand[0].revealed = false;
        player.hand[1].revealed = false;
        this.table.playersHands[player.user._id] = player.hand;
      }, 3000);

      // Broadcast to the player
    });
  }

  nextTurn() {
    this.players[this.currTurnIndex].isTurn = false;
    this.currTurnIndex = (this.currTurnIndex + 1) % this.players.length;

    currPlayer = this.players[this.currTurnIndex];
    currPlayer.isTurn = true;

    // Start the turn timer

    // Broadcast to players

    // Wait for player's action
    this.gameSocketManager.waitForPlayerAction(currPlayer.user._id).then((content) => {
      // Stop the turn timer

      // Process player's action
      this.processPlayerAction(currPlayer, content);
    });
  }

  processPlayerAction(player, content) {
    const { action, card, target } = content;

    switch (action) {
      case "play":
        this.playCard(player, card, target);
        break;
      case "discard":
        this.discardCard(player, card);
        break;
      case "draw":
        this.drawCard(player);
        break;
      default:
        break;
    }
  }
}
