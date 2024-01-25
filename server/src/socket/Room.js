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
  isAdmin: boolean,
}
*/

class Room {
  constructor(name, players, numberOfPlayers, password) {
    this.id = v4();
    this.name = name;
    this.status = "waiting";
    this.game = new Game(this);

    this.players = players.map((player) => ({ user: player.user, ws: player.ws, isAdmin: false, status: "idle" }));
    this.players[0].isAdmin = true;

    this.numberOfPlayers = numberOfPlayers;
    if (password) {
      this.password = password;
    }
  }

  // For rooms list
  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map((player) => ({
        id: player.user._id,
        name: player.user.name,
        isAdmin: player.isAdmin,
        status: player.status,
      })),
      status: this.status,
      numberOfPlayers: this.numberOfPlayers,
      isPrivate: !!this.password,
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

  joinRoom(player, password) {
    console.log(password);
    if (this.status !== "waiting") {
      return "Room is during a game.";
    }
    if (this.password && password && this.password !== password) {
      return "Wrong password.";
    }
    if (this.players.length === this.numberOfPlayers) {
      return "Room is full.";
    }
    if (this.players.some((p) => p.user._id === player.user._id)) {
      return "Already in the room.";
    }
    this.players.push({ user: player.user, ws: player.ws, status: "idle" });
    return "";
  }

  leaveRoom(player) {
    const playerIndex = this.players.findIndex((p) => p.user._id === player.user._id);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);

      if (player.isAdmin && this.players.length > 0) {
        this.players[0].isAdmin = true;
      }

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
      this.players.map((player) => (player.status = "playing"));
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
