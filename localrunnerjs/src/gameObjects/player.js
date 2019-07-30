const Territory = require('./territory');
const { Saw } = require('./bonuses');
const { UP, DOWN, LEFT, RIGHT, SPEED, WINDOW_HEIGHT, WINDOW_WIDTH, WIDTH } = require('../constants');
const { batchDraw, drawSquare, includes } = require('../helpers');

const deniedDirection = {
  [UP]: DOWN,
  [DOWN]: UP,
  [LEFT]: RIGHT,
  [RIGHT]: LEFT,
};

class Player {
  constructor(id, x, y, name, color, client) {
    this.speed = SPEED;
    this.direction = null;
    this.prevDirection = null;

    this.id = id;
    this.x = x;
    this.y = y;
    this.color = color.map((item, index) => {
      if (index === color.length - 1) return item;
      if (item >= 25) return item - 25;
      return item;
    });
    this.lineColor = [...color.slice(-1), color[3] + 160];
    this.territory = new Territory(x, y, color);
    this.lines = [];
    this.bonuses = [];
    this.name = name;
    this.score = 0;
    this.tick_score = 0;

    this.debugLog = [];
    this.client = client;
    this.isDisconnected = false;
  }

  changeDirection(command) {
    this.prevDirection = this.direction;

    if (![UP, DOWN, LEFT, RIGHT].includes(command)) throw new Error('Unknown direction');

    if (deniedDirection[command] !== this.direction) this.direction = command;
  }

  move() {
    if (this.direction === UP) this.y += this.speed;
    if (this.direction === DOWN) this.y -= this.speed;
    if (this.direction === LEFT) this.x -= this.speed;
    if (this.direction === RIGHT) this.x += this.speed;
  }

  drawLines() {
    console.log('DRAW LINES', this.lines, this.lineColor);
  }
  drawPosition() {
    console.log('DRAW POSITION', [this.x, this.y], this.color);
  }

  updateLines() {
    if (!includes([this.x, this.y], this.territory.points) || this.lines > 0) {
      this.lines.push([this.x, this.y]);
    }
  }

  sendMessage(t, d) {
    if (this.isDisconnected) return;
    try {
      this.client.sendMessage(t, d);
    } catch (ex) {
      console.log(`write exception`, this.client.getSolutionId, ex);
      this.isDisconnected = true;
      this.client.close();
    }
  }

  removeBonus(bonus) {
    this.bonuses = this.bonuses.filter(b => b !== bonus);
  }

  removeSawBonus() {
    const saw = this.bonuses.find(b => b instanceof Saw);
    if (saw) {
      saw.cancel();
      this.removeBonus(saw);
    }
  }

  tickAction() {
    this.bonuses.forEach(bonus => {
      bonus.tick += 1;
      if (bonus.tick >= bonus.activeTicks) {
        bonus.cancel();
        this.removeBonus(bonus);
      }
    });
  }

  getBonusesState() {
    return this.bonuses.map(bonus => ({ type: bonus.visioName, ticks: bonus.getRemainingTicks() }));
  }

  getState() {
    return {
      score: this.score,
      direction: this.direction,
      territory: [...this.territory.points],
      lines: [...this.lines],
      position: [this.x, this.y],
      bonuses: this.getBonusesState(),
    };
  }

  getCommand(tick) {
    if (this.isDisconnected) return;

    try {
      const { debugInfo, errorInfo, command } = this.client.getCommand();
      [debugInfo, errorInfo].filter(info => info).forEach(info => this.debugLog.push({ tick, message: info }));
      return command;
    } catch (ex) {
      //   args = e.args
      //   if len(args) > 0:
      //   self.debug_log.append({'tick': tick, 'message': args[0]})
      // else:
      //   self.debug_log.append({'tick': tick, 'message': str(e)})
      //   print('read exception', self.client.get_solution_id(), e)
      this.isDisconnected = true;
      this.client.close();
    }
  }

  saveLog(path) {
    console.log('SAVE LOG', path);
  }

  _getLine(dx, dy) {
    let [x, y] = this;
    const points = [];
    while (0 < x && x < WINDOW_WIDTH && 0 < y && y < WINDOW_HEIGHT) {
      x += dx;
      y += dy;
      points.push([x, y]);
    }
    return points;
  }

  getDirectionLine() {
    const { direction: dir } = this;
    if (dir === UP) return this._getLine(0, WIDTH);
    if (dir === DOWN) return this._getLine(0, -WIDTH);
    if (dir === LEFT) return this._getLine(-WIDTH, 0);
    if (dir === RIGHT) return this._getLine(WIDTH, 0);
  }

  diffPosition(direction, x, y, val) {
    const { direction: dir } = this;
    if (dir === UP) return [x, y - val];
    if (dir === DOWN) return [x, y + val];
    if (dir === LEFT) return [x + val, y];
    if (dir === RIGHT) return [x - val, y];
  }

  getPosition() {
    if (!this.direction) return [this.x, this.y];

    let [x, y] = this;

    const halfWidth = Math.round(WIDTH / 2);
    while (!((x - halfWidth) % WIDTH === 0 && (y - halfWidth) % WIDTH === 0)) {
      [x, y] = this.diffPosition(this.direction, x, y, this.speed);
    }

    return [[x, y], x !== this.x && y !== this.y];
  }

  getPrevPosition() {
    if (!this.prevDirection) return [this.x, this.y];

    return this.diffPosition(this.prevDirection, this.x, this.y, WIDTH);
  }

  isAte(playersToCaptured) {
    for (const [p, captured] of playersToCaptured) {
      const [position, isMove] = this.getPosition();
      if (this !== p && includes(position, captured) && (isMove || includes(this.getPrevPosition(), captured))) {
        return true;
      }
    }
    return false;
  }
}
