import { v4 } from "uuid";
import Game from "./Game.js";
import { broadcastRoomsListToLobby } from "../socket/roomsManager.js";
import { User } from "../models/userModel.js";

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

export default class Room {
  constructor(name, players, numberOfPlayers, password) {
    this.id = v4();
    this.name = name;
    this.status = "waiting";

    this.game = null;

    this.players = players.map((player) => ({ user: player.user, ws: player.ws, isAdmin: false, status: "idle" }));
    this.players[0].isAdmin = true;
    this.admin = this.players[0].user._id;

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
      password: this.password,
      admin: this.admin,
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
      const isAdmin = this.players[playerIndex].isAdmin;

      this.players.splice(playerIndex, 1);

      if (isAdmin && this.players.length > 0) {
        this.players[0].isAdmin = true;
        this.admin = this.players[0].user._id;
      }

      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  kickPlayer(kickerUser, playerId) {
    if (kickerUser._id !== this.admin) {
      console.log("Not admin.");
      return false;
    }

    const playerIndex = this.players.findIndex((p) => p.user._id === playerId);

    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);

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

  async startGame() {
    if (this.players.every((player) => player.status === "ready")) {
      this.players.map((player) => (player.status = "playing"));
      this.status = "playing";
      await User.updateMany({ _id: { $in: this.players.map((player) => player.user._id) } }, { inGame: false }).exec();

      this.game = new Game(this);
      this.players.forEach((player) => {
        const playerWs = player.ws;
        playerWs.session.game = this.game;
        playerWs.send(
          JSON.stringify({
            type: "startGame",
            content: { success: true, message: "Start game.", data: {} },
          })
        );
      });

      this.game.runGame();

      return true;
    } else {
      console.log("Not all players are ready.");
      return false;
    }
  }

  async endGame() {
    this.status = "waiting";
    this.game = null;
    this.players.map((player) => (player.status = "idle"));
    this.players.forEach((player) => (player.ws.session.game = null));
    await User.updateMany({ _id: { $in: this.players.map((player) => player.user._id) } }, { inGame: false }).exec();

    this.updateRoomInfoPlayers(); // Broadcast to clients in the room
    broadcastRoomsListToLobby(this.players.map((player) => player.ws)); // Broadcast to clients in the lobby
  }
}
