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
            resolve({ letter: content.data, playerId: ws.session.user._id });
          }
        });
      });
    });
  }

  sendResponseToClientGuess(response, playerId) {
    this.playersIdToWs[playerId].send(
      JSON.stringify({
        type: "guessResponse",
        content: { data: response },
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
          type: "endOfGame",
          content: { data: endOfGameMessage },
        })
      );
    });
  }
}
