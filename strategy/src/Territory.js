/*
  Территория игрока
  territory: Array<Point>

  полезные методы и тд
  update
  --- пока не надо
 */
const { UP, LEFT, RIGHT, DOWN } = require('../../localrunnerjs/src/constants');
const { includesPoint, includesCoordinate } = require('./utils/heplers');
const Point = require('./Point');

class Territory {
  constructor(points, root) {
    this.points = points;
    this.root = root;
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

  getNearestPoint(position) {
    let minDistance = Infinity;
    let nearestPoint;
    for (const point of this.points) {
      const distance = position.distanceSq(point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    return nearestPoint;
  }

  isBorder(point) {
    const { halfWidth, mapWidth, mapHeight } = this.root.world;
    const { x, y } = point;

    return (
      x < halfWidth ||
      x >= mapWidth + halfWidth ||
      y < halfWidth ||
      y >= mapHeight + halfWidth
    );
  }

  getVertAndHoriz(point, width = 30) {
    // const { width } = this.root.world;

    return [
      point.clone().addScalarY(width),
      point.clone().subtractScalarY(width),
      point.clone().subtractScalarX(width),
      point.clone().addScalarX(width),
    ].filter(p => !this.isBorder(point));
  }

  getBoundaryPoints() {
    const { position, direction } = this.root.player;
    const boundaryPoints = [];

    const territoryObjX = {};
    const territoryObjY = {};
    for (const p of this.points) {
      if (!territoryObjX[p.x]) territoryObjX[p.x] = [p];
      else territoryObjX[p.x].push(p);
      if (!territoryObjY[p.y]) territoryObjY[p.y] = [p];
      else territoryObjY[p.y].push(p);
    }

    const getNearPoint = (key, point, points) => {
      let result;
      let dt = Infinity;
      for (const p of points) {
        const s = Math.abs(p[key] - point[key]);
        if (s < dt) {
          dt = s;
          result = p;
        }
      }
      return result;
    };

    const key = direction === LEFT || direction === RIGHT ? 'y' : 'x';
    const size =
      key === 'x' ? this.root.world.mapHeight : this.root.world.mapWidth;
    const arr = key === 'y' ? territoryObjY : territoryObjX;
    let i = 0;
    while (i < size) {
      i++;
      if (!arr[i] || !arr[i].length) continue;
      const yPoints = arr[i];
      boundaryPoints.push(getNearPoint(key, position, yPoints));
    }

    return boundaryPoints;
  }
}

module.exports = Territory;
