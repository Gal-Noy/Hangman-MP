import { getRandomWord } from "../utils/wordsUtils.js";

class Game {
  constructor(room) {
    this.room = room;
    this.players = null;
    this.round = 0;
    this.currWord = null;
    this.time = 0;
    this.timer = null;
    this.isStarted = false;
    this.isEnded = false;
    this.winner = null;
  }

  startGame(players) {
    this.players = players;
    this.round = 1;
    this.time = 60;
    this.isStarted = true;
    this.isEnded = false;
    this.winner = null;

    this.players.forEach((player) => {
      player.score = 0;
    });

    this.nextRound();
  }

  nextRound() {
    if (this.round <= 10) {
      this.currWord = getRandomWord();
      this.time = 60;
      this.timer = setInterval(() => {
        this.time -= 1;
        if (this.time === 0) {
          clearInterval(this.timer);
          this.nextRound();
        }
      }, 1000);
    } else {
      this.endGame();
    }
  }

  endGame() {
    this.isStarted = false;
    this.isEnded = true;
    this.winner = this.players.reduce((winner, player) => {
      if (player.score > winner.score) {
        return player;
      } else {
        return winner;
      }
    }, this.players[0]);
  }

  getGameData() {
    return {
      round: this.round,
      word: this.word,
      definition: this.definition,
      time: this.time,
      isStarted: this.isStarted,
      isEnded: this.isEnded,
      winner: this.winner,
    };
  }

  getPlayersData() {
    return this.players.map((player) => {
      return {
        user: player.user,
        score: player.score,
      };
    });
  }

  getGameDataForPlayer(player) {
    return {
      round: this.round,
      word: this.word,
      definition: this.definition,
      time: this.time,
      isStarted: this.isStarted,
      isEnded: this.isEnded,
      winner: this.winner,
      player: {
        user: player.user,
        score: player.score,
      },
    };
  }

  checkAnswer(player, answer) {
    if (answer === this.word) {
      player.score += 1;
      return true;
    } else {
      return false;
    }
  }

  skipWord() {
    clearInterval(this.timer);
    this.nextRound();
  }

  stopGame() {
    clearInterval(this.timer);
    this.isStarted = false;
    this.isEnded = true;
  }

  getRoundData() {
    return {
      round: this.round,
      word: this.word,
      definition: this.definition,
      time: this.time,
    };
  }

  getRoundDataForPlayer(player) {
    return {
      round: this.round,
      word: this.word,
      definition: this.definition,
      time: this.time,
      player: {
        user: player.user,
        score: player.score,
      },
    };
  }

  getRoundDataForPlayers() {
    return this.players.map((player) => {
      return {
        round: this.round,
        word: this.word,
        definition: this.definition,
        time: this.time,
        player: {
          user: player.user,
          score: player.score,
        },
      };
    });
  }
}

export default Game;
