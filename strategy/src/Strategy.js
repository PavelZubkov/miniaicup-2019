const StackFSM = require('./utils/StackFSM');
const World = require('./World');
const Player = require('./Player');

class Strategy extends StackFSM {
  constructor(strategies) {
    super();
    this.players = {};
    this.bonuses = [];
    this.world = null;
    this.isFirstUpdate = true;
    this.myId = null;

    this.strategies = [];
    for (const Strategy of strategies) {
      this.strategies.push(new Strategy(this));
    }
    this.pushState(this.strategies[0]);
  }

  log(...args) {
    console.error(...args);
  }

  startGame({ x_cells_count, y_cells_count, speed, width }) {
    this.world = new World({ x_cells_count, y_cells_count, speed, width });
  }

  endGame(params) {
    this.log('end game', params);
  }

  getPlayer() {
    return this.players[this.myId];
  }

  changeCommand(command) {
    this.getPlayer().direction = command;
  }

  getCommand() {
    return this.getPlayer().direction;
  }

  firstUpdate(players) {
    this.isFirstUpdate = false;

    const length = Object.keys(players).length;
    for (let i = 1; i <= length; i += 1) {
      if (!players[i]) this.myId = i;
      const playerData = players[i === this.myId ? 'i' : i];
      this.players[i] = new Player(i, playerData);
    }
  }

  update({ players, bonuses, tick_num: tick }) {
    this.world.update(tick);
    this.bonuses = bonuses;

    if (this.isFirstUpdate) {
      this.firstUpdate(players);
    } else {
      for (let i = 1; i <= players.length; i += 1) {
        this.players[i].update(players[i]);
      }
    }

    super.update();
  }
}

module.exports = Strategy;
