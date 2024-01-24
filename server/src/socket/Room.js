import { v4 } from "uuid";
import Game from "./Game.js";

/*
player: {
  user: {
    id: string,
    name: string,
  },
  ws: WebSocket,
  status: "idle" | "ready" | "playing" | "finished",
}
*/

class Room {
  constructor(name, players) {
    this.id = v4();
    this.name = name;
    this.players = players.map((player) => ({ user: player.user, ws: player.ws, status: "idle", score: 0 }));
    this.status = "waiting";
    this.game = new Game(this);
  }

  // For rooms list
  getRoomDataForList() {
    return {
      id: this.id,
      name: this.name,
      players: this.players.length,
      status: this.status,
    };
  }

  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map((player) => ({ user: player.user, status: player.status, score: player.score })),
      status: this.status,
    };
  }

  // Broadcast to all clients in the room
  broadcastUpdateRoom() {
    this.broadcast({
      type: "updateRoom",
      content: { success: true, message: "Update room.", data: { room: this.getRoomData() } },
    });
  }

  joinRoom(player) {
    if (players.length < 4) {
      this.players.push({ user: player.user, ws: player.ws, status: "idle", score: 0 });

      broadcastUpdateRoom();

      return true;
    } else {
      console.log("Room is full.");
      return false;
    }
  }

  leaveRoom(player) {
    const playerIndex = this.players.findIndex((p) => p.user.id === player.user.id);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);

      broadcastUpdateRoom();

      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  readyPlayer(player) {
    const playerIndex = this.players.findIndex((p) => p.user.id === player.user.id);
    if (playerIndex !== -1) {
      this.players[playerIndex].status = "ready";

      broadcastUpdateRoom();

      if (this.players.every((player) => player.status === "ready")) {
        this.startGame();
      }
      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  startGame() {
    if (this.players.every((player) => player.status === "ready")) {
      this.status = "playing";

      broadcastUpdateRoom();

      // Delete this line
      ws.send(
        JSON.stringify({
          type: "startGameResponse",
          content: { success: true, message: "Start game success.", data: { room: this.getRoomData() } },
        })
      );
      // this.game.startGame(this.players); TODO: Uncomment this line

      return true;
    } else {
      console.log("Not all players are ready.");
      return false;
    }
  }
}

export default Room;
