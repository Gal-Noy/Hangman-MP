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
          content: this.game.timer,
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
      Object.values(this.playersIdToWs).forEach((ws, playerId) => {
        ws.on("message", function message(data, isBinary) {
          const message = isBinary ? data : JSON.parse(data);
          const { type, content } = message;
          if (type === "guessLetter") {
            resolve(content.data, playerId);
          }
        });
      });
    });
  }

  sendResponseToClientGuess(response, playerId) {
    this.playersIdToWs[playerId].send(
      JSON.stringify({
        type: "guessResponse",
        content: response,
      })
    );
  }

  broadcastEndOfRoundMessage(endOfRoundMessage) {
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "endOfRound",
          content: endOfRoundMessage,
        })
      );
    });
  }

  broadcastEndGame(endOfGameMessage) {
    Object.values(this.playersIdToWs).forEach((ws) => {
      ws.send(
        JSON.stringify({
          type: "endOfGame",
          content: endOfGameMessage,
        })
      );
    });
  }
}
