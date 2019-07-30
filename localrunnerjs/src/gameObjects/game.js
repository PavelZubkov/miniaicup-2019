const { isIntersect, includes, randomInteger, randomChoose } = require('../helpers');
const {
  WIDTH,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  PLAYER_COLORS,
  MAX_TICK_COUNT,
  BONUS_CHANCE,
  BONUSES_MAX_COUNT,
  X_CELLS_COUNT,
  Y_CELLS_COUNT,
  SPEED,
  NEUTRAL_TERRITORY_SCORE,
  ENEMY_TERRITORY_SCORE,
  LINE_KILL_SCORE,
  SAW_KILL_SCORE,
  AVAILABLE_BONUSES,
  SAW_SCORE,
} = require('../constants');
const Player = require('./player');
const { Nitro, Slowdown, Bonus, Saw } = require('./bonuses');

class Game {
  static getAvailableBonuses() {
    return [Nitro, Slowdown, Saw].filter(bonus => AVAILABLE_BONUSES.includes(bonus));
  }

  constructor(clients) {
    const players = [];
    const coordinates = this.getCoordinates()
    clients.forEach((client, index) => players.push(
      new Player(index + 1, )
    ));

    this.availableBonuses = Game.getAvailableBonuses();
  }

  getBusyPoints() {
    const playersPoints = this.players.map(({ x, y }) => [x, y]);
    const bonusesPoints = this.bonuses.map(({ x, y }) => [x, y]);
    const linesPoints = [];
    this.players.forEach(player => linesPoints.push(...player.lines));

    return [...playersPoints, ...bonusesPoints, ...linesPoints];
  }

  generateBonus() {
    if (!this.availableBonuses.length) return;
    if (randomInteger(0, BONUS_CHANCE) !== 1 || this.bonuses.length >= BONUSES_MAX_COUNT) return;

    const coors = Bonus.generateCoordinates(this.players, this.getBusyPoints());
    const Bonus = randomChoose(this.availableBonuses);
    this.bonuses.push(new Bonus(coors));
  }

  getCoordinates(clientsCount) {
    const coors = {
      1: [[285, 435]],
      2: [[285, 285], [285, 585]],
      3: [[285, 285], [285, 585], [585, 585]],
      4: [[165, 255], [165, 675], [465, 765], [465, 165]],
      5: [[165, 255], [165, 675], [465, 765], [465, 165], [765, 255]],
      6: [[165, 255], [165, 675], [465, 765], [465, 165], [765, 255], [675, 675]],
    };
    return coors[clientsCount];
  }
}
