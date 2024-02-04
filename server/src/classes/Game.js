import { GameSocketManager } from "../socket/GameSocketManager.js";
import { getRandomWord, getKeypadLetters } from "../utils/utils.js";

export default class Game {
  constructor(room, gameRules) {
    this.room = room;
    this.gameSocketManager = new GameSocketManager(
      this,
      room.players.reduce((acc, player) => {
        acc[player.user._id] = player.ws;
        return acc;
      }, {})
    );

    const { totalRounds, timerDuration, cooldownDuration } = gameRules;

    this.currRound = 1;
    this.totalRounds = !totalRounds ? 5 : totalRounds;
    this.currentWord = null;
    this.hiddenWord = "";
    this.keypadLetters = [];
    this.usedLetters = [];
    this.remainingWrongAttempts = 5;
    this.score = 0;

    this.timer = 0;
    this.timerInterval = null;
    this.timerDuration = !timerDuration ? 61 : timerDuration + 1;

    this.cooldown = 0;
    this.cooldownInterval = null;
    this.cooldownDuration = !cooldownDuration ? 4 : cooldownDuration + 1;
  }

  runGame() {
    this.nextRound();
  }

  async nextRound() {
    if (this.shouldEndGame()) {
      this.endGame();
      this.room.endGame();
      return;
    }

    await this.nextWord();

    this.sendInitialState();

    this.startCooldown();
    await this.waitForCooldown();

    setTimeout(() => {
      this.sendGameState();
    }, 1000);

    this.startTimer();

    await this.handleRound();
  }

  async handleRound() {
    while (!this.checkRoundEnd()) {
      const { letter, playerId } = await this.gameSocketManager.waitForPlayersActions();
      this.handlePlayerAction(letter, playerId);
    }
    this.endRound();
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

    if (this.cooldown > 0) {
      // Cooldown is still active
      this.gameSocketManager.sendResponseToClientGuess("Cooldown is still active", false, playerId);
      return;
    }

    if (this.usedLetters.includes(guessedLetter)) {
      // The letter has already been used
      this.gameSocketManager.sendResponseToClientGuess("Letter has already been used", false, playerId);
    } else {
      this.usedLetters.push(guessedLetter);
      if (this.currentWord.word.includes(guessedLetter)) {
        // Update hiddenWord with guessed letter(s)
        for (let i = 0; i < this.currentWord.word.length; i++) {
          if (this.currentWord.word[i] === guessedLetter) {
            this.hiddenWord = this.hiddenWord.substring(0, i) + guessedLetter + this.hiddenWord.substring(i + 1);
          }
        }
        if (this.hiddenWord !== this.currentWord.word) {
          this.gameSocketManager.sendResponseToAllPlayers(
            `${guessedLetter.toUpperCase()} - Correct guess!`,
            true,
            playerId
          );
          this.score += 10;
        }
      } else {
        this.remainingWrongAttempts--;
        if (this.remainingWrongAttempts > 0) {
          this.gameSocketManager.sendResponseToAllPlayers(
            `${guessedLetter.toUpperCase()} - Incorrect guess!`,
            false,
            playerId
          );
          this.score -= 5;
        }
      }
    }

    this.sendGameState();
  }

  checkRoundEnd() {
    if (this.hiddenWord === this.currentWord.word || this.remainingWrongAttempts === 0 || this.timer === 0) {
      // Increase score if the word is guessed correctly
      this.score += this.hiddenWord === this.currentWord.word ? 50 : 0;

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

  sendInitialState() {
    const initialState = {
      players: this.room.players.map((player) => ({
        name: player.user.name,
        avatar: player.user.avatar,
        id: player.user._id,
      })),
      remainingWrongAttempts: this.remainingWrongAttempts,
      score: this.score,
      round: this.currRound,
      totalRounds: this.totalRounds,
    };

    this.gameSocketManager.broadcastGameState(initialState);
  }

  sendGameState() {
    const gameState = {
      players: this.room.players.map((player) => ({
        name: player.user.name,
        avatar: player.user.avatar,
        id: player.user._id,
      })),
      definition: this.currentWord.definition,
      hiddenWord: this.hiddenWord,
      keypadLetters: this.keypadLetters,
      usedLetters: this.usedLetters,
      remainingWrongAttempts: this.remainingWrongAttempts,
      score: this.score,
      round: this.currRound,
      totalRounds: this.totalRounds,
    };

    this.gameSocketManager.broadcastGameState(gameState);
  }

  startCooldown() {
    this.cooldown = this.cooldownDuration;
    this.cooldownInterval = setInterval(() => {
      this.cooldown--;
      this.gameSocketManager.broadcastCooldown();
      if (this.cooldown === 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  async waitForCooldown() {
    while (this.cooldown > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  startTimer() {
    this.timer = this.timerDuration;
    this.timerInterval = setInterval(() => {
      this.timer--;
      this.gameSocketManager.broadcastTimer();
      if (this.timer === 0) {
        this.checkRoundEnd();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  endRound() {
    setTimeout(() => {
      this.nextRound();
    }, 3000);
  }

  shouldEndGame() {
    return this.currRound > this.totalRounds;
  }

  async endGame() {
    const endOfGameMessage = `Game Over! Your final score is ${this.score}.`;
    this.gameSocketManager.broadcastEndGame(endOfGameMessage);
  }

  removePlayer(player) {
    this.gameSocketManager.removePlayer(player.user._id);
    this.sendGameState();
  }
}
