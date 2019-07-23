const { drawSquareWithImage, getRandomCoordinates, batchDraw, randomChoose, includes } = require('../helpers');
const { WIDTH } = require('../constants');

class Bonus {
  constructor(point) {
    this.imagePath = null;
    this.color = null;
    this.name = null;
    this.visioName = null;

    this.x = point[0];
    this.y = point[1];
    this.tick = 0;
    this.activeTicks = Bonus.generateActiveTicks();
  }

  static generateActiveTicks() {
    return randomChoose([10, 20, 30, 40, 50, 60]);
  }

  static isAvailablePoint(x, y, players, busyPoints) {
     for (const p of players) {
         if (
           (p.x -2 * WIDTH <= x && x <= p.x + 2 * WIDTH)
           && (p.y - 2 * WIDTH <= y && y <= p.y + 2 * WIDTH)
         ) return false;
     }

     return !includes([x, y], busyPoints);
  }

  static generateCoordinates(players, busyPoints) {
     let [x, y] = getRandomCoordinates();

     while (!Bonus.isAvailablePoint(x, y, players, busyPoints)) {
       ([x, y] = getRandomCoordinates());
     }

     return [x, y];
  }

  draw() {
    drawSquareWithImage([this.x, this.y], this.color, this.imagePath, this.activeTicks);
  }

  isAte(player, captured) {
    return (this.x === player.x && this.y === player.y) || includes([this.x, this.y], captured);
  }

  getRemainingTicks() {
    return this.activeTicks - this.tick;
  }

  cancel(player) {}

  getState() {
    return { 'type': this.visioName, position: [this.x, this.y] };
  }
}

class Nitro extends Bonus {
  constructor(point) {
    super(point);
    this.color = [255, 249, 221, 255];
    this.imagePath = 'sprites/flash.png';
    this.name = 'Нитро';
    this.visioName = 'n';
  }

  /**
   *
   * @param player
   * @param player.bonuses {Nitro}
   * @param player.speed {number}
   */
  apply(player) {
    const b = player.bonuses.find(bonus => bonus instanceof this);
    if (b) {
      b.activeTicks += this.activeTicks;
    } else {
      player.bonuses.push(this);

      while (player.speed < WIDTH) {
        player.speed += 1;
        if (WIDTH % player.speed === 0) break;
      }
    }
  }

  /**
   *
   * @param player
   * @param player.speed {number}
   */
  cancel(player) {
    while (player.speed < WIDTH) {
      player.speed -= 1;
      if (WIDTH % player.speed === 0) break;
    }
  }
}

class Slowdown extends Bonus {
  constructor(point) {
    super(point);
    this.color = [234, 249, 255, 255];
    this.imagePath = 'sprites/explorer.png';
    this.name = 'Замедление';
    this.visioName = 's';
  }

  /**
   *
   * @param player
   * @param player.bonuses {Slowdown}
   * @param player.speed {number}
   */
  apply(player) {
    const b = player.bonuses.find(bonus => bonus instanceof this);
    if (b) {
      b.activeTicks += this.activeTicks;
    } else {
      player.bonuses.push(this);

      while (player.speed < WIDTH) {
        player.speed -= 1;
        if (WIDTH % player.speed === 0) break;
      }
    }
  }

  /**
   *
   * @param player
   * @param player.speed {number}
   */
  cancel(player) {
    while (player.speed < WIDTH) {
      player.speed += 1;
      if (WIDTH % player.speed === 0) break;
    }
  }
}

class Saw extends Bonus {
  constructor(point) {
    super(point);
    this.color = [226, 228, 226, 255];
    this.imagePath = 'sprites/saw.png';
    this.name = 'Пила';
    this.visioName = 'saw';
    Saw.lines = [];
    Saw.territories = [];
    Saw.opacityStep = 10;
    Saw.lineColor = [180, 236, 246];
    Saw.log = [];
  }

  static appendLine(line) {
    Saw.lines.push([255, line]);
  }

  static appendTerritory(territory, color) {
    Saw.territories.push([color, territory]);
  }

  static drawTerritories() {
    for (let pair of Saw.territories.slice()) {
      pair[0] = [...pair[0].slice(0, 3), pair[0][3] = Saw.opacityStep];
      if (pair[0][3] <= 0) {
        Saw.territories.filter(p => p.toString() !== pair.toString());
      } else {
        batchDraw(pair[1], pair[0]);
      }
    }
  }

  static drawLines() {
    for (let pair of Saw.lines.slice()) {
      pair[0] -= Saw.opacityStep;
      if (pair[0] <= 0) {
        Saw.lines.filter(p => p.toString() !== pair.toString());
      } else {
        batchDraw(pair[1], [...Saw.lineColor, pair[0]]);
      }
    }
  }

  apply(player) {
      this.activeTicks = 0;
      player.bonuses.push(this);
  }

  cancel(player) {}
}

module.exports = { Bonus, Nitro, Slowdown, Saw };
