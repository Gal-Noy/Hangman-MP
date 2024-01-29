export default class Player {
  constructor(user, ws, game, table) {
    this.user = user;
    this.ws = ws;
    this.game = game;
    this.table = table;
    this.hand = [];
    this.isTurn = false;
    this.score = 0;
  }

  
}
