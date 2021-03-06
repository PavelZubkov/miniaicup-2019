/*
  Игрок

  данные игрока
  update

  itsMe
 */
const Point = require('./Point');
const Territory = require('./Territory');

class Player {
  constructor(id, { score, direction, territory, lines, position }, root) {
    this.id = id;
    this.score = score;
    this.direction = direction;
    this.territory = new Territory(territory, root);
    this.lines = lines;
    this.position = new Point.fromArray(position);
  }

  update({ score, direction, territory, lines, position }, root) {
    this.score = score;
    this.prevDirection = direction;
    this.direction = direction;
    this.territory = new Territory(territory, root);
    this.lines = lines;
    this.prevPosition = this.position;
    this.position = new Point.fromArray(position);
  }
}

module.exports = Player;
