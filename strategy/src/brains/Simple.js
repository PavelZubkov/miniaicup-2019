const {
  UP,
  LEFT,
  RIGHT,
  DOWN,
} = require('../../../localrunnerjs/src/constants');
const { includesPoint, randomInteger } = require('../utils/heplers');

class Simple {
  constructor(brain) {
    this.name = 'Simple';
    this.brain = brain;

    this.nextDirection = 0;
    this.nextChange = 0;
  }

  changeCommand() {
    const commands = [RIGHT, UP, LEFT, DOWN];
    const command = commands[this.nextDirection % commands.length];
    this.nextDirection += 1;
    this.brain.changeCommand(command);
  }

  getNextPoint() {
    const currentCommand = this.brain.getCommand();
    const { width } = this.brain.world;
    const currentPoint = this.brain.getPlayer().position.clone();

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
        throw new Error(`Unexpected command ${currentCommand}`);
    }
  }

  isBorder(point) {
    const { halfWidth, mapWidth, mapHeight } = this.brain.world;
    const { x, y } = point;

    return (
      x < halfWidth ||
      x > mapWidth + halfWidth ||
      y < halfWidth ||
      y > mapHeight + halfWidth
    );
  }

  isEmptyNextPoint() {
    const nextPoint = this.getNextPoint();
    const { lines } = this.brain.getPlayer();
    return !includesPoint(nextPoint, lines) || !this.isBorder(nextPoint);
  }

  update() {
    if (!this.nextChange || !this.isEmptyNextPoint()) {
      this.nextChange = randomInteger(1, 4);
      this.changeCommand();

      let attempts = 0;
      while (!this.isEmptyNextPoint() && attempts < 3) {
        this.changeCommand();
        attempts += 1;
      }
    }

    this.nextChange -= 1;
  }
}

module.exports = Simple;
