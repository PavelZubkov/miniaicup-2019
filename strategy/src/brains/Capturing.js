const {
  UP,
  LEFT,
  RIGHT,
  DOWN,
} = require('../../../localrunnerjs/src/constants');
const {
  includesPoint,
  randomInteger,
  randomChoose,
  getObjectCoors,
} = require('../utils/heplers');

class Simple {
  constructor(root) {
    this.name = 'Capturing';
    this.root = root;

    this.nextDirection = 0;
    this.nextChange = 0;

    this.commands = [LEFT, DOWN, RIGHT, UP];
  }

  changeCommand(cmd) {
    if (cmd) this.root.changeCommand(cmd); // helper for change direction in debugger

    const nextCommand = {
      [LEFT]: DOWN,
      [DOWN]: RIGHT,
      [RIGHT]: UP,
      [UP]: LEFT,
    };
    const { direction } = this.root.player;
    this.root.changeCommand(nextCommand[direction]);
  }

  getNextPoint() {
    const currentCommand = this.root.getCommand();
    const { width } = this.root.world;
    const currentPoint = this.root.getPlayer().position.clone();

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

  isEmptyPoint(point) {
    const { lines } = this.root.getPlayer();
    const result = !includesPoint(point, lines) && !this.isBorder(point);
    return result;
  }

  isLocatedIsOwnTerritory(point) {
    const { territory, position } = this.root.player;
    return includesPoint(point || position, territory.points);
  }

  update() {
    let nextPoint = this.getNextPoint();

    if (!nextPoint) this.changeCommand();

    if (this.isLocatedIsOwnTerritory()) {
      return this.root.pushStateByName('GoStartPoint'); // go out from territory
    }

    if (
      this.root.player.lines.length % 3 === 0 ||
      !this.isEmptyPoint(nextPoint)
    ) {
      this.changeCommand();

      nextPoint = this.getNextPoint();

      let attempts = 0;
      while (!this.isEmptyPoint(nextPoint) && attempts < 10) {
        this.changeCommand();
        attempts += 1;
        nextPoint = this.getNextPoint();
      }
    }
  }
}

module.exports = Simple;
