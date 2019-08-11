const StackFSM = require('./utils/StackFSM');
const World = require('./World');
const Player = require('./Player');
const { UP, LEFT, RIGHT, DOWN } = require('../../localrunnerjs/src/constants');
const {
  includesPoint,
  randomInteger,
  randomChoose,
  getObjectCoors,
} = require('./utils/heplers');

class Strategy extends StackFSM {
  constructor(strategies) {
    super();
    this.players = null;
    this.bonuses = [];
    this.world = null;
    this.myId = null;

    this.strategies = [];
    for (const Strategy of strategies) {
      this.strategies.push(new Strategy(this));
    }
    this.pushState(this.strategies[0], false);
  }

  log(...args) {
    if (process.env.NODE_ENV !== 'production') console.error(...args);
  }

  pushStateByName(name) {
    const strategy = this.strategies.find(strat => strat.name === name);
    if (!strategy) throw new Error(`Unexpected strategy: ${name}`);
    this.pushState(strategy);
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

  get player() {
    return this.players[this.myId];
  }

  changeCommand(command) {
    if (!command) return;
    this.player.direction = command;
  }

  set nextCommand(command) {
    this.player.direction = command;
  }

  get nextCommand() {
    return this.player.direction;
  }

  getCommand() {
    return this.player.direction;
  }

  initPlayers(players) {
    this.players = {};

    for (let i = 1; i <= 6; i += 1) {
      if (!players[i]) this.myId = i;
      const playerData = players[i === this.myId ? 'i' : i];
      this.players[i] = new Player(i, playerData);
    }
  }

  tickUpdate({ players, bonuses, tick_num: tick }) {
    this.world.update(tick);
    this.bonuses = bonuses;

    if (!this.players) {
      this.initPlayers(players);
    } else {
      for (let i = 1; i <= 6; i += 1) {
        const playerData = players[i === this.myId ? 'i' : i];
        if (playerData) this.players[i].update(playerData);
        else {
          this.players[i] = null;
        }
      }
    }
    super.update();
  }

  // isEnemyCollisionMyLines() {
  //   const { lines } = this.player;
  //
  //   for (let i = 1; i <= 6; i++) {
  //     if (i === this.myId) continue;
  //     const player = this.players[i];
  //     if (!player) continue;
  //
  //     const { direction, position } = player;
  //     const playerNextPoint = this.strategies[0].getNextPoint(
  //       direction,
  //       position
  //     );
  //
  //     if (includesPoint(playerNextPoint, lines)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // utils
}

module.exports = Strategy;
