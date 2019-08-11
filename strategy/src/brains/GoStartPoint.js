const {
  UP,
  LEFT,
  RIGHT,
  DOWN,
} = require('../../../localrunnerjs/src/constants');
const { sortSidePoints } = require('../utils/heplers');

class GoStartPoint {
  constructor(root) {
    this.name = 'GoStartPoint';
    this.root = root;
    this.targetPoint = null;
    this.counter = 0;
  }

  oppositeCommand(command) {
    const opposite = {
      [UP]: DOWN,
      [DOWN]: UP,
      [LEFT]: RIGHT,
      [RIGHT]: LEFT,
    };
    return opposite[command];
  }

  selectDirection() {
    const { territory, position, direction } = this.root.player;
    const sidesPoints = territory.takePointsFromAllSide(position);
    delete sidesPoints[this.oppositeCommand(direction)];

    for (const side of Object.keys(sidesPoints)) {
      const nextPoint = this.getNextPoint(side);
      if (this.isBorder(nextPoint)) delete sidesPoints[side];
    }

    const distances = {};
    Object.keys(sidesPoints).forEach(side => {
      const points = sidesPoints[side];
      if (!points.length) {
        points.push(position);
      }

      const sorted = sortSidePoints(side, points);
      const nextIsBorder = this.isBorder(this.getNextPoint(side, sorted[0]));
      const length = nextIsBorder ? Infinity : sorted[0].distanceSq(position);
      distances[side] = {
        length,
        point: sorted[0],
      };
    });

    const sortedDistances = Object.entries(distances).sort(
      (a, b) => a[1].length - b[1].length
    );
    const [nextDirection, { length, point }] = sortedDistances[0];
    return { nextDirection, point, length };
  }

  getNextPoint(currentCommand, point) {
    const { width } = this.root.world;
    const currentPoint = point || this.root.getPlayer().position.clone();

    switch (currentCommand) {
      case UP:
        return currentPoint.addScalarY(width);
      case DOWN:
        return currentPoint.subtractScalarY(width);
      case LEFT:
        return currentPoint.subtractScalarX(width);
      case RIGHT:
        return currentPoint.addScalarX(width);
      default:
        return null;
    }
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

  end() {
    this.targetPoint = null;
    this.counter = 0;
    this.root.popState();
  }

  update() {
    this.counter++;
    if (this.counter > 15) debugger;
    const { nextDirection, point, length } = this.selectDirection();
    this.root.changeCommand(nextDirection);
    this.targetPoint = point;
    if (length === -1) return this.end();
    if (this.root.player.lines.length) this.end();
  }
}

module.exports = GoStartPoint;
