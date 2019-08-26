const {
  UP,
  LEFT,
  RIGHT,
  DOWN,
} = require('../../../localrunnerjs/src/constants');
const { includesPoint, randomChoose } = require('../utils/heplers');
const Point = require('../Point');

class Simple {
  constructor(root) {
    this.name = 'Capturing';
    this.root = root;

    this.stages = {
      First: 'Run',
      Second: 'Escaping',
      Lazy: 'LazyEscaping',
    };
    this.stage = this.stages.First;

    this.prevDirection = null;
    this.maxDist = 7;
    this.nextChange = this.maxDist;
  }

  getNextCommands() {
    const { direction } = this.root.player;
    const nextCommands = {
      [LEFT]: [UP, DOWN],
      [DOWN]: [LEFT, RIGHT],
      [RIGHT]: [DOWN, UP],
      [UP]: [RIGHT, LEFT],
      null: [UP, DOWN, LEFT, RIGHT],
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

  getNextPoint(command, position) {
    const currentCommand = command || this.root.getCommand();
    const { width } = this.root.world;

    const currentPoint = position
      ? position.clone()
      : this.root.player.position.clone();

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
    const result =
      !includesPoint(point, lines) &&
      !this.isBorder(point) &&
      !this.isPlayerCollision(point);
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
      // const prevCommand = this.root.player.direction;
      // const allowCommands = this.getNextCommands();
      // const command = randomChoose(allowCommands);
      // const nextPointOne = this.getNextPoint(command);
      // if (this.isEmptyPoint(nextPointOne)) {
      //   this.nextChange = this.maxDist;
      //   this.stage = this.stages.Lazy;
      //   this.root.changeCommand(command);
      //   return;
      // }
      //
      // const lastCommand = allowCommands.find(c => c !== command);
      // const nextPointTwo = this.getNextPoint(lastCommand);
      // if (this.isEmptyPoint(nextPointTwo)) {
      //   this.nextChange = this.maxDist;
      //   this.stage = this.stages.Lazy;
      //   this.root.changeCommand(lastCommand);
      //   return;
      // }
      //
      // this.nextChange = 1;
      // this.root.changeCommand(prevCommand);
      this.nextChange = this.maxDist;
      this.stage = this.stages.Lazy;
      this.stepToPoint(nextPoint);
    }
  }

  changeStageSecond(nextPoint, targetPoint) {
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
      const nearestTerritoryPoint =
        targetPoint || territory.getNearestPoint(position);

      const directions = [UP, LEFT, DOWN, RIGHT]
        .filter(dir => dir !== this.oppositeCommand(direction))
        .map(dir => {
          const point = this.getNextPoint(dir);
          if (!this.isEmptyPoint(point)) return null;
          // nextPoint не на моей территории?
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

  /*
    расстояние от меня до врагов
    расстояние от меня до граничных точек моей территории
   */
  getDistanceToPoints(point, points) {
    const distances = [];
    for (const p of points) {
      distances.push({ point: p, distance: p.distance(point) });
    }
    return distances;
  }

  getDistanceToEnemies() {
    const { position: myPosition } = this.root.player;
    const { myId } = this.root;

    const distances = [];
    for (let i = 1; i <= 6; i++) {
      if (i === myId) continue;
      const player = this.root.players[i];
      if (!player) continue;

      distances.push({
        playerId: i,
        distance: myPosition.distance(player.position),
      });
    }

    return distances;
  }

  getDistanceToBoundaryTerritoryPoints() {
    const { position: myPosition, territory } = this.root.player;
    const points = territory.getBoundaryPoints();
    const distances = this.getDistanceToPoints(myPosition, points);
    return distances;
  }

  isEnemyIsAttacking() {
    /*
      берем позиции всех врагов кроме моей
      ищем ближайший поинт от каждого врага до моейго шлейфа
      считаем для них растояния
      ищем ближайшую точку
    */
    const { position: myPosition, territory } = this.root.player;

    const distanceToEnemies = this.getDistanceToEnemies();
    const nearestTerritoryPoint = territory.getNearestPoint(myPosition);
    const myDistance = myPosition.distance(nearestTerritoryPoint) + 125;

    const result = distanceToEnemies.some(
      enemy => enemy.distance <= myDistance
    );
    return result;
  }

  isPlayerCollision(nextPoint) {
    const { myId } = this.root;

    for (let i = 1; i <= 6; i++) {
      if (i === myId) continue;
      const player = this.root.players[i];
      if (!player) continue;

      const { direction, position } = player;
      const playerNextPoint = this.getNextPoint(direction, position);

      if (playerNextPoint.isEqualTo(nextPoint)) {
        this.root.log('COLISION');
        return true;
      }
    }
    return false;
  }

  /*
    Делает шаг по направлеию к поинту
   */
  stepToPoint(tagetPoint) {
    const { direction } = this.root.player;

    const directions = [UP, LEFT, DOWN, RIGHT]
      .filter(dir => dir !== this.oppositeCommand(direction))
      .map(dir => {
        const point = this.getNextPoint(dir);
        if (!this.isEmptyPoint(point)) return null;
        // nextPoint не на моей территории?
        return {
          dir,
          point,
          distance: point.distance(tagetPoint),
        };
      })
      .filter(v => v)
      .sort((a, b) => a.distance - b.distance);

    // this.root.log('DIRECTIONS', JSON.stringify(directions, null, 2));
    if (directions.length) {
      this.root.changeCommand(directions[0].dir);
    }
  }

  /*
   * Взять расстояния до врагов
   * Взять расстояние до граничных клеток моей территории
   * Найти такую граничную клетку, у которой:
   *   максимальное расстояние до меня, при этом расстояние меньше чем до ближайшего врага
   * Повернуть в ее сторону
   * */
  getLazyPoint() {
    const { position, territory } = this.root.player;
    const enemyDistances = this.getDistanceToEnemies();
    const boundaryPoints = territory.getBoundaryPoints();
    debugger;
    const distancesToBoundaryPoints = this.getDistanceToPoints(
      position,
      boundaryPoints
    );

    enemyDistances.sort((a, b) => a.distance - b.distance);
    const nearestEnemyDistance = enemyDistances.length
      ? enemyDistances[0].distance
      : Infinity;

    let targetPoint;
    let distanceToTarget = 0;
    for (const { point, distance } of distancesToBoundaryPoints) {
      if (distance < nearestEnemyDistance && distance > distanceToTarget) {
        targetPoint = point;
        distanceToTarget = distance;
      }
    }

    return targetPoint;
  }

  reset() {
    if (this.stage !== this.stages.Lazy) this.lazyTargetPoint = null;
  }

  update() {
    // debugger;
    let nextPoint = this.getNextPoint();

    this.reset();

    if (!nextPoint)
      this.root.changeCommand(randomChoose(this.getNextCommands()));

    if (this.isLocatedIsOwnTerritory() && !this.goStartPointBlocked) {
      this.stage = this.stages.First;
      this.goStartPointBlocked = true;
      return this.root.pushStateByName('GoStartPoint'); // go out from territory
    }

    if (this.goStartPointBlocked) {
      this.nextChange = this.maxDist;
      this.goStartPointBlocked = false;
    }

    if (this.isEnemyIsAttacking()) {
      this.stage = this.stages.Second;
      this.nextChange = 0;
      return this.changeStageSecond(nextPoint);
    }

    if (this.stage === this.stages.First)
      return this.changeStageFirst(nextPoint);
    else if (this.stage === this.stages.Second)
      return this.changeStageSecond(nextPoint);
    else {
      if (!this.lazyTargetPoint) this.lazyTargetPoint = this.getLazyPoint();
      this.stepToPoint(this.lazyTargetPoint);
      return;
    }
  }
}

module.exports = Simple;
