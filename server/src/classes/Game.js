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

    this.isRoundActive = false;
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

    this.isRoundActive = true;

    await this.nextWord();

    this.sendInitialState();

    this.startCooldown();
    await this.waitForCooldown();

    setTimeout(() => {
      this.sendGameState();
    }, 1000);

    this.startTimer();

    this.handleRound();
  }

  async handleRound() {
    while (this.isRoundActive) {
      const { letter, playerId } = await Promise.race([
        this.gameSocketManager.waitForPlayersActions(),
        this.checkRoundEnd(),
        this.waitForTimerExpiration(),
      ]);
      if (letter && playerId && this.isRoundActive) {
        this.handlePlayerAction(letter, playerId);
      }
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
          this.score = Math.max(0, this.score - 5);
        }
      }
    }

    this.sendGameState();
  }

  checkRoundEnd() {
    return new Promise((resolve) => {
      if (this.hiddenWord === this.currentWord.word) {
        this.isRoundActive = false;
        this.stopTimer();
        this.gameSocketManager.broadcastEndOfRoundMessage("Correct word!");
        this.score += this.remainingWrongAttempts * 10;
        this.currRound++;
        resolve({});
      } else if (this.remainingWrongAttempts === 0) {
        this.isRoundActive = false;
        this.stopTimer();
        this.gameSocketManager.broadcastEndOfRoundMessage(
          `Out of attempts! The word was '${this.currentWord.word.toUpperCase()}'`
        );
        this.currRound++;
        resolve({});
      }
    });
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
        this.isRoundActive = false;
        this.stopTimer();
        this.gameSocketManager.broadcastEndOfRoundMessage(
          `Time's up! The word was '${this.currentWord.word.toUpperCase()}'`
        );
        this.currRound++;
      }
    }, 1000);
  }

  waitForTimerExpiration() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({});
      }, this.timerDuration * 1000);
    });
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  endRound() {
    setTimeout(() => {
      this.nextRound();
    }, 2000);
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
