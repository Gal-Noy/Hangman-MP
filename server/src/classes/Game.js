import { GameSocketManager } from "../socket/GameSocketManager.js";
import { getRandomWord, getKeypadLetters } from "../utils/utils.js";

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
    this.keypadLetters = [];
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
    this.sendGameState();
    this.startTimer();

    while (!this.checkRoundEnd()) {
      const { letter, playerId } = await this.gameSocketManager.waitForPlayersActions();
      this.handlePlayerAction(letter, playerId);
    }

    this.nextRound();
  }

  async nextWord() {
    this.currentWord = await getRandomWord();
    this.hiddenWord = "_".repeat(this.currentWord.word.length);
    this.remainingWrongAttempts = 5;
    this.keypadLetters = await getKeypadLetters(this.currentWord.word);
    this.usedLetters = [];
  }

  handlePlayerAction(letter, playerId) {
    const guessedLetter = letter.toLowerCase();
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
    this.gameSocketManager.sendResponseToClientGuess(response, playerId);
    this.sendGameState();
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
      return true;
    }
    return false;
  }

  sendGameState() {
    const gameState = {
      players: this.room.players.map((player) => ({
        name: player.user.name,
      })),
      definition: this.currentWord.definition,
      hiddenWord: this.hiddenWord,
      keypadLetters: this.keypadLetters,
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
