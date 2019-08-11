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
const Point = require('../Point');

class Simple {
  constructor(root) {
    this.name = 'Capturing';
    this.root = root;

    this.nextChange = 3;

    this.stages = {
      First: 1,
      Second: 2,
    };
    this.stage = this.stages.First;

    this.prevDirection = null;
    this.maxDist = 6;
  }

  getNextCommands() {
    const { direction } = this.root.player;
    const nextCommands = {
      [LEFT]: [UP, DOWN],
      [DOWN]: [LEFT, RIGHT],
      [RIGHT]: [DOWN, UP],
      [UP]: [RIGHT, LEFT],
      null: [UP],
    };
    return nextCommands[direction];
  }

  // changeCommand(cmd) {
  //   if (cmd) this.root.changeCommand(cmd); // helper for change direction in debugger
  //
  //
  //   if (this.stage === this.stages.First) {
  //     const next = randomChoose(nextCommands[direction]);
  //     this.root.changeCommand(next);
  //   }
  // }

  getNextPoint(command) {
    const currentCommand = command || this.root.getCommand();
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

  oppositeCommand(command) {
    const opposite = {
      [UP]: DOWN,
      [DOWN]: UP,
      [LEFT]: RIGHT,
      [RIGHT]: LEFT,
    };
    return opposite[command];
  }

  changeStageFirst(nextPoint) {
    /*
      беру рандомное направление одно из перпендикулярных
        если он не доступно беру втрое
        если второе не доступно движусь
          возвращаю изначальное направление
          некст чендж = 1
        если первое или второе доступно
          некст сендж = 3
          стедж = стаджеСеконд
     */
    if (this.nextChange > 0) this.nextChange -= 1;

    if (this.nextChange === 0 || !this.isEmptyPoint(nextPoint)) {
      const prevCommand = this.root.player.direction;
      const allowCommands = this.getNextCommands();
      const command = randomChoose(allowCommands);
      const nextPointOne = this.getNextPoint(command);
      if (this.isEmptyPoint(nextPointOne)) {
        this.nextChange = this.maxDist;
        this.stage = this.stages.Second;
        this.root.changeCommand(command);
        return;
      }

      const lastCommand = allowCommands.find(c => c !== command);
      const nextPointTwo = this.getNextPoint(lastCommand);
      if (this.isEmptyPoint(nextPointTwo)) {
        this.nextChange = this.maxDist;
        this.stage = this.stages.Second;
        this.root.changeCommand(lastCommand);
        return;
      }

      this.nextChange = 1;
      this.root.changeCommand(prevCommand);
    }
  }

  changeStageSecond(nextPoint) {
    /*
      нахожу ближайшую точку ко мне точку дома
      если она доступна - поворачиваю на нее
      если она не доступна - беру ближайшую из оставшихся точек
      если она доступна - поворачиваю на нее
      если она не доступна - беру последнюю точку
      поворачиваю на нее

      (если зашел домой, меняю стадже на ферст
     */
    if (this.nextChange > 0) this.nextChange -= 1;
    if (this.nextChange === 0 || !this.isEmptyPoint(nextPoint)) {
      const { territory, position, direction } = this.root.player;
      const nearestTerritoryPoint = territory.getNearestPoint(position);

      const directions = [UP, LEFT, DOWN, RIGHT]
        .filter(dir => dir !== this.oppositeCommand(direction))
        .map(dir => {
          const point = this.getNextPoint(dir);
          if (!this.isEmptyPoint(point)) return null;
          return {
            dir,
            point,
            distance: point.distanceSq(nearestTerritoryPoint),
          };
        })
        .filter(v => v)
        .sort((a, b) => a.distance - b.distance);

      // this.root.log('DIRECTIONS', JSON.stringify(directions, null, 2));
      if (directions.length) {
        this.root.changeCommand(directions[0].dir);
        this.nextChange = 1;
      } else {
        this.nextChange = 1;
      }
    }
  }

  isEnemyIsAttacking() {
    /*
      берем позиции всех врагов кроме моей
      ищем ближайший поинт от каждого врага до моейго шлейфа
      считаем для них растояния
      ищем ближайшую точку
    */
    const { lines, position: myPosition, territory } = this.root.player;
    const { myId } = this.root;

    const distances = [];
    for (let i = 1; i <= 6; i++) {
      if (i === myId) continue;
      const player = this.root.players[i];
      if (!player) continue;

      let minDist = Infinity;
      for (const p of lines) {
        const point = new Point.fromArray(p);
        const dist = point.distance(player.position);
        if (dist < minDist) minDist = dist;
      }
      distances.push(minDist);
    }

    let myDistance = Infinity;
    for (const point of territory.points) {
      const dist = point.distance(myPosition);
      if (dist < myDistance) myDistance = dist;
    }
    this.root.log(`ESCAPING`, { myDistance }, { distances });
    return distances.some(d => d <= myDistance + 200);
  }

  update() {
    let nextPoint = this.getNextPoint();

    if (!nextPoint)
      this.root.changeCommand(randomChoose(this.getNextCommands()));

    if (this.isLocatedIsOwnTerritory()) {
      this.stage = this.stages.First;
      return this.root.pushStateByName('GoStartPoint'); // go out from territory
    }

    debugger;
    if (this.isEnemyIsAttacking()) {
      this.stage = this.stages.Second;
      this.changeStageSecond(nextPoint);
    }

    if (this.stage === this.stages.First) this.changeStageFirst(nextPoint);
    else this.changeStageSecond(nextPoint);
  }
}

module.exports = Simple;
