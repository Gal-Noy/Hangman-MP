import { v4 } from "uuid";
import Game from "./Game.js";
import { set } from "mongoose";

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
    this.players = players.map((player) => ({ user: player.user, ws: player.ws, status: "idle" }));
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
      players: this.players.map((player) => ({ name: player.user.name, status: player.status })),
      status: this.status,
    };
  }

  // Broadcast to all clients in the room
  updateRoomInfoPlayers() {
    this.players.forEach((player) => {
      player.ws.send(
        JSON.stringify({
          type: "updateRoomInfo",
          content: { success: true, message: "Update players about room info.", data: { room: this.getRoomData() } },
        })
      );
    });
  }

  joinRoom(player) {
    if (this.players.length < 4) {
      this.players.push({ user: player.user, ws: player.ws, status: "idle" });

      return true;
    } else {
      console.log("Room is full.");
      return false;
    }
  }

  leaveRoom(player) {
    const playerIndex = this.players.findIndex((p) => p.user._id === player.user._id);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);

      this.updateRoomInfoPlayers();

      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  toggleReadyPlayer(player) {
    const playerIndex = this.players.findIndex((p) => p.user._id === player.user._id);
    if (playerIndex !== -1) {
      this.players[playerIndex].status = this.players[playerIndex].status === "idle" ? "ready" : "idle";

      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  checkAllPlayersReady() {
    return this.players.every((player) => player.status === "ready");
  }

  startGame() {
    if (this.players.every((player) => player.status === "ready")) {
      this.status = "playing";

      this.updateRoomInfoPlayers();

      // Delete this line
      this.players.forEach((player) => {
        player.ws.send(
          JSON.stringify({
            type: "START GAME",
            content: { success: true, message: "START GAME.", data: { room: this.getRoomData() } },
          })
        );
      });
      // this.game.startGame(this.players); TODO: Uncomment this line

      return true;
    } else {
      console.log("Not all players are ready.");
      return false;
    }
  }
}

export default Room;
