const {
  UP,
  LEFT,
  RIGHT,
  DOWN,
} = require('../../../localrunnerjs/src/constants');
const { sortSidePoints } = require('../utils/heplers');

class Escaping {
  constructor(root) {
    this.name = 'Escaping';
    this.root = root;
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
    this.root.popState();
  }

  update() {
    /*
      условия входа: врагу на две клетки ближе к моему шлейфу, чем мне до территории(до ближайших точек)
      условие выхода: !условие входа ИЛИ я вернулся домой
     */
  }
}

module.exports = Escaping;
