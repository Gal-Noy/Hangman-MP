import { GameSocketManager } from "../socket/GameSocketManager.js";
import { getRandomWord } from "../utils/utils.js";

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
    this.room.players.forEach((player) => (player.ws.session.game = this));

    this.currRound = 1;
    this.totalRounds = 5;
    this.currentWord = null;
    this.hiddenWord = "";
    this.usedLetters = [];
    this.remainingWrongAttempts = 0;
    this.score = 0;
    this.terminate = false;

    this.timer = 0;
    this.timerInterval = null;
    this.timerDuration = 60;
  }

  runGame() {
    this.nextRound();
  }

  async nextRound() {
    if (this.shouldEndGame()) {
      this.endGame();
      return;
    }

    await this.nextWord();
    this.broadcastGameState();
    this.startTimer();

    // Wait for players actions (guesses)
    this.gameSocketManager.waitForPlayersActions().then((data, playerId) => {
      this.handlePlayerAction(data, playerId);
    });
  }

  async nextWord() {
    this.currentWord = await getRandomWord();
    this.hiddenWord = "_".repeat(this.currentWord.word.length);
    this.remainingWrongAttempts = this.currentWord.word.length + 2;
    this.usedLetters = [];
  }

  handlePlayerAction(data, playerId) {
    const guessedLetter = data.letter.toLowerCase();
    let response = "";

    if (this.usedLetters.includes(guessedLetter)) {
      // The letter has already been used
      response = "Letter has already been guessed";
    } else {
      this.usedLetters.push(guessedLetter);
      if (this.currentWord.word.includes(guessedLetter)) {
        // Update hiddenWord with guessed letter(s)
        for (let i = 0; i < this.currentWord.word.length; i++) {
          if (this.currentWord.word[i] === guessedLetter) {
            this.hiddenWord = this.hiddenWord.substring(0, i) + guessedLetter + this.hiddenWord.substring(i + 1);
          }
        }
        response = "Correct guess";
      } else {
        this.remainingWrongAttempts--;
        response = "Incorrect guess";
      }
    }

    // Send response to the client
    this.sendResponseToClientGuess(response, playerId);

    // Check if the round should end after the player's guess
    this.checkRoundEnd();
  }

  checkRoundEnd() {
    if (this.hiddenWord === this.currentWord.word || this.remainingWrongAttempts === 0 || this.timer === 0) {
      // Increase score if the word is guessed correctly
      this.score += this.hiddenWord === this.currentWord.word ? 1 : 0;

      this.currRound++;
      this.stopTimer();

      // Determine the reason for the round end
      const endOfRoundMessage =
        this.hiddenWord === this.currentWord.word
          ? "Correct word!"
          : this.remainingWrongAttempts === 0
          ? "Out of attempts!"
          : "Time's up!";

      this.gameSocketManager.broadcastEndOfRoundMessage(endOfRoundMessage);
      this.nextRound();
    }
  }

  broadcastGameState() {
    const gameState = {
      definition: this.currentWord.definition,
      hiddenWord: this.hiddenWord,
      usedLetters: this.usedLetters,
      remainingWrongAttempts: this.remainingWrongAttempts,
      score: this.score,
      round: this.currRound,
    };
    console.log(gameState);

    this.gameSocketManager.broadcastGameState(gameState);
  }

  startTimer() {
    this.timer = this.timerDuration;
    this.timerInterval = setInterval(() => {
      this.timer--;
      this.gameSocketManager.broadcastTimer();
      if (this.timer === 0) {
        this.stopTimer();
        this.checkRoundEnd();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  shouldEndGame() {
    return this.currRound > this.totalRounds || this.terminate;
  }

  endGame() {
    const endOfGameMessage = `Game Over! Your final score is ${this.score}.`;
    this.gameSocketManager.broadcastEndGame(endOfGameMessage);
  }
}
