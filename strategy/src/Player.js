/*
  Игрок

  данные игрока
  update

  itsMe
 */
const Point = require('./Point');

class Player {
  constructor(id, { score, direction, territory, lines, position }) {
    this.id = id;
    this.score = score;
    this.direction = direction;
    this.territory = territory;
    this.lines = lines;
    this.position = new Point.fromArray(position);
  }

  update({ score, direction, territory, lines, position }) {
    this.score = score;
    this.prevDirection = direction;
    this.direction = direction;
    this.territory = territory;
    this.lines = lines;
    this.prevPosition = this.position;
    this.position = new Point.fromArray(position);
  }
}

module.exports = Player;
