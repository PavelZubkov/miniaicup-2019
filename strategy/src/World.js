class World {
  constructor({ x_cells_count, y_cells_count, speed, width }) {
    this.xCellsCount = x_cells_count;
    this.yCellsCount = y_cells_count;
    this.mapWidth = x_cells_count * width;
    this.mapHeight = y_cells_count * width;
    this.speed = speed;
    this.width = width;
    this.halfWidth = width / 2;
    this.tick = 0;
  }

  update(tick) {
    this.tick = tick;
  }
}

module.exports = World;
