import { v4 } from "uuid";
import Game from "./Game.js";

/*
player: {
  user: {
    id: string,
    name: string,
  },
  ws: WebSocket,
  status: "idle" | "ready" | "playing",
  isAdmin: boolean,
}
*/

export default class Room {
  constructor(name, players, numberOfPlayers, password, gameRules) {
    this.id = v4();
    this.name = name;
    this.status = "waiting";

    this.game = null;

    this.players = players.map((player) => ({ user: player.user, ws: player.ws, isAdmin: false, status: "idle" }));
    this.players[0].isAdmin = true;
    this.admin = this.players[0];

    this.numberOfPlayers = numberOfPlayers;
    if (password) {
      this.password = password;
    }

    if (gameRules) {
      this.gameRules = gameRules;
    } else {
      this.gameRules = {
        totalRounds: 5,
        timerDuration: 60,
        cooldownDuration: 3,
      };
    }
  }

  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map((player) => ({
        id: player.user._id,
        name: player.user.name,
        isAdmin: player.isAdmin,
        status: player.status,
        avatar: player.user.avatar,
      })),
      status: this.status,
      numberOfPlayers: this.numberOfPlayers,
      isPrivate: !!this.password,
      password: this.password,
      admin: {
        id: this.admin.user._id,
        name: this.admin.user.name,
      },
      gameRules: this.gameRules,
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
    this.players.push({ user: player.user, ws: player.ws, status: "idle", isAdmin: false });

    this.unreadyAllPlayers();

    return "";
  }

  leaveRoom(player) {
    const playerIndex = this.players.findIndex((p) => p.user._id === player.user._id);
    if (playerIndex !== -1) {
      const isAdmin = this.players[playerIndex].isAdmin;

      this.players.splice(playerIndex, 1);

      if (isAdmin && this.players.length > 0) {
        this.players[0].isAdmin = true;
        this.admin = this.players[0];
      }

      this.unreadyAllPlayers();

      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  kickPlayer(kickerUser, playerId) {
    if (kickerUser._id !== this.admin.user._id) {
      console.log("Not admin.");
      return false;
    }

    const playerIndex = this.players.findIndex((p) => p.user._id === playerId);

    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);

      this.unreadyAllPlayers();

      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }

  modifyRoom(newName, newNumberOfPlayers, newGameRules, newPassword, isPrivate) {
    if (newName) {
      this.name = newName;
      return `Room name changed to ${newName}.`;
    }
    if (newNumberOfPlayers) {
      this.numberOfPlayers = newNumberOfPlayers;
      return `Number of players changed to ${newNumberOfPlayers}.`;
    }
    if (newGameRules) {
      if (newGameRules.totalRounds) {
        this.gameRules.totalRounds = newGameRules.totalRounds;
        return `Total rounds changed to ${newGameRules.totalRounds}.`;
      }
      if (newGameRules.timerDuration) {
        this.gameRules.timerDuration = newGameRules.timerDuration;
        return `Timer duration changed to ${newGameRules.timerDuration}.`;
      }
      if (newGameRules.cooldownDuration) {
        this.gameRules.cooldownDuration = newGameRules.cooldownDuration;
        return `Cooldown duration changed to ${newGameRules.cooldownDuration}.`;
      }
    }
    if (this.password) {
      if (!isPrivate) {
        this.password = null;
        return `Room privacy changed to public.`;
      } else if (newPassword !== this.password) {
        if (newPassword.length >= 4) {
          this.password = newPassword;
          return `Room password changed to '${newPassword}'.`;
        } else {
          return `Password must be at least 4 characters long.`;
        }
      }
    } else if (newPassword) {
      if (newPassword.length >= 4) {
        this.password = newPassword;
        return `Room privacy changed to private, with password '${newPassword}'.`;
      } else {
        return `Password must be at least 4 characters long.`;
      }
    }
    return "No changes made.";
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

  unreadyAllPlayers() {
    this.players.map((player) => (player.status = "idle"));
  }

  checkAllPlayersReady() {
    return this.players.every((player) => player.status === "ready");
  }

  async startGame() {
    if (this.players.every((player) => player.status === "ready")) {
      this.players.map((player) => (player.status = "playing"));
      this.status = "playing";

      this.game = new Game(this, this.gameRules);
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
  }

  async returnPlayerToRoom(playerId) {
    const playerIndex = this.players.findIndex((p) => p.user._id === playerId);
    if (playerIndex !== -1) {
      this.players[playerIndex].status = "idle";
      this.players[playerIndex].ws.session.game = null;
      return true;
    } else {
      console.log("Player not found.");
      return false;
    }
  }
}
