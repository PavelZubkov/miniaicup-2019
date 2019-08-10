/*
  Территория игрока
  territory: Array<Point>

  полезные методы и тд
  update
  --- пока не надо
 */
const { UP, LEFT, RIGHT, DOWN } = require('../../localrunnerjs/src/constants');
const Point = require('./Point');

class Territory {
  constructor(points) {
    this.points = points;
  }

  get points() {
    return this._territory;
  }

  set points(points) {
    this._territory = points.map(p => new Point.fromArray(p));
  }

  takePointsFromDirection(direction, position) {
    const [key, oppositeKey] =
      direction === UP || direction === DOWN ? ['y', 'x'] : ['x', 'y'];
    const func =
      direction === UP || direction === RIGHT
        ? point => point[key] > position[key]
        : point => point[key] < position[key];

    return this.points
      .filter(p => p[oppositeKey] === position[oppositeKey])
      .filter(func);
  }

  takePointsFromAllSide(position) {
    return [UP, DOWN, LEFT, RIGHT].reduce((acc, key) => {
      acc[key] = this.takePointsFromDirection(key, position);
      return acc;
    }, {});
  }
}

module.exports = Territory;
