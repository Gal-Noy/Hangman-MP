export class GameSocketManager {
  constructor(game, playersIdToWs) {
    this.game = game;
    this.playersIdToWs = playersIdToWs;
  }

  broadcastTimer() {
    // Send timer to all players ws
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "timerUpdate",
          content: {
            data: this.game.timer,
          },
        })
      );
    });
  }

  broadcastCooldown() {
    // Send cooldown to all players ws
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "cooldownUpdate",
          content: {
            data: this.game.cooldown,
          },
        })
      );
    });
  }

  broadcastGameState(gameState) {
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "gameStateUpdate",
          content: {
            success: true,
            message: "Game state updated",
            data: gameState,
          },
        })
      );
    });
  }

  waitForPlayersActions() {
    return new Promise((resolve) => {
      Object.values(this.playersIdToWs).forEach((ws) => {
        ws.once("message", function message(data, isBinary) {
          const message = isBinary ? data : JSON.parse(data);
          console.log(message, ws.session.user.name);
          const { type, content } = message;
          if (type === "game" && content.action === "guessLetter") {
            resolve({ letter: content.data, playerId: ws.session.user._id });
          }
        });
      });
    });
  }

  sendResponseToClientGuess(response, success, playerId) {
    this.playersIdToWs[playerId].send(
      JSON.stringify({
        type: "guessResponse",
        content: {
          data: {
            success,
            message: response,
          },
        },
      })
    );
  }

  broadcastEndOfRoundMessage(endOfRoundMessage) {
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "endOfRound",
          content: { data: endOfRoundMessage },
        })
      );
    });
  }

  broadcastEndGame(endOfGameMessage) {
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "gameOver",
          content: { data: endOfGameMessage },
        })
      );
    });
  }

  removePlayer(playerId) {
    delete this.playersIdToWs[playerId];
  }
}
