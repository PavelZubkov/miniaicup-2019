const _ = require('loadsh');
const nx = require('jsnetworkx');
const Vect = require('../../Vector');
const { inPolygon, batchDrawTerritory, getNeighboring, getVertAndHoriz, includes } = require('../helpers');
const { WIDTH, LEFT, RIGHT, UP, DOWN } = require('../constants');

class Territory {
  constructor(x, y, color) {
    this.color = color;
    this.points = [[x, y], ...getNeighboring([x, y])];
    this.changed = true;
  }

  draw() {
    batchDrawTerritory(this.points, this.color, this.changed);
    this.changed = false;
  }

  getBoundary() {
    const boundary = [];
    for (const point of this.points) {
      if (getNeighboring(point).some(neighboring => !includes(neighboring, this.points))) {
        boundary.push(point);
      }
    }

    return boundary;
  }

  getNearestBoundary(point, boundary) {
    for (const neighbor of [point, ...getNeighboring(point)]) {
      if (includes(neighbor, boundary)) return neighbor;
    }
  }

  _capture(boundary) {
    const polygonXarr = boundary.map(([x, y]) => x);
    const polygonYarr = boundary.map(([x, y]) => y);

    const maxX = _.max(polygonXarr);
    const minX = _.min(polygonXarr);
    const maxY = _.max(polygonYarr);
    const minY = _.min(polygonYarr);

    const captured = [];

    let x = maxX;
    while (x > minX) {
      let y = maxY;
      while (y > minY) {
        if (!includes([x, y], this.points) && inPolygon(x, y, polygonYarr, polygonYarr)) {
          captured.push([x, y]);
        }
        y -= WIDTH;
      }
      x -= WIDTH;
    }

    return captured;
  }

  isSiblings(p1, p2) {
    return includes(p2, getVertAndHoriz(p1));
  }

  getVoidsBetweenLinesAndTerritory(lines) {
    const boundary = this.getBoundary();
    const voids = [];
    for (const [lp1, iLp1] of lines.map((lp1, iLp1) => [lp1, iLp1])) {
      for (const point of getNeighboring(lp1)) {
        if (includes(point, boundary)) {
          let prev = null;

          for (const lp2 of lines.slice(0, iLp1 + 1)) {
            const startPoint = this.getNearestBoundary(lp2, boundary);
            if (!startPoint) {
              prev = startPoint;
              return;
            }

            if (prev && (this.isSiblings(prev, startPoint) || Vect.equals(prev, startPoint))) {
              prev = startPoint;
              continue;
            }

            const endIndex = boundary.findIndex(p => Vect.equals(point, p));
            const startIndex = boundary.findIndex(p => Vect.equals(startPoint, p));

            let path;
            try {
              path = this.getPath(startIndex, endIndex, boundary);
            } catch (ex) {
              console.log(ex);
              continue;
            }
            if (!path.length) continue;

            if (path.length > 1 && path[0] === path[path.length - 1]) {
              path = path.slice(1);
            }

            path = path.map(index => boundary[index]);
            const indexLp2 = lines.findIndex(([x, y]) => x === lp2[0] && y === lp2[1]);
            const linesPath = lines.slice(indexLp2, iLp1 + 1);

            voids.push([...linesPath, ...path]);

            prev = startPoint;
          }
        }
      }
    }
  }

  captureVoidsBetweenLines(lines) {
    const captured = [];
    for (const [index, cur] of Object.entries(lines)) {
      for (const point of getNeighboring(cur)) {
        if (includes(point, lines)) {
          const endIndex = lines.index(point);
          const path = lines.slice(index, endIndex + 1);
          if (path.length >= 8) captured.push(this._capture(path));
        }
      }
    }

    return captured;
  }

  capture(lines) {
    const captured = [];
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1];
      if (includes(lastLine, this.points)) {
        const voids = this.getVoidsBetweenLinesAndTerritory(lines);
        this.captureVoidsBetweenLines(lines).forEach(l => Vect.pushUniqVec(l, captured));

        for (const line of lines) {
          if (!includes(line, this.points)) {
            Vect.pushUniqVec(line, captured);
          }
        }

        for (const voidItem of voids) {
          this._capture(voidItem).forEach(item => Vect.pushUniqVec(item, captured));
        }
      }
    }

    if (captured.length > 0) this.changed = true;
    return captured;
  }

  removePoints(points) {
    const removed = [];
    for (const point of points) {
      if (includes(point, points)) {
        this.points = this.points.filter(p => !Vect.equals(point, p));
        removed.push(point);
      }
    }

    if (removed.length > 0) this.changed = true;
    return removed;
  }

  getSiblings(point, boundary) {
    return getNeighboring(point).filter(sibling => includes(sibling, boundary));
  }

  getPath(starIndex, endIndex, boundary) {
    const graph = new nx.classes.Graph();
    for (const [index, point] of boundary.entries()) {
      const siblings = this.getSiblings(point, boundary);
      for (const sibling of siblings) {
        graph.addEdge(index, boundary.findIndex(p => Vect.equals(p, sibling)), {
          weight: 1,
        });
      }
    }

    return nx.algorithms.shortestPath(graph, { source: endIndex, target: starIndex, weight: 'weight' });
  }

  split(line, direction, player) {
    const removed = [];
    const lPoint = line[0];

    if (line.some(point => includes(point, this.points))) {
      for (const point of this.points) {
        if ([UP, DOWN].includes(direction)) {
          if (player.x < lPoint[0]) {
            if (point[0] >= lPoint[0]) {
              removed.push(point);
              this.points = this.points.filter(p => Vect.equals(p, point));
            }
          } else {
            if (point[0] <= lPoint[0]) {
              removed.push(point);
              this.points = this.points.filter(p => Vect.equals(p, point));
            }
          }
        }

        if ([LEFT, RIGHT].includes(direction)) {
          if (player.y < lPoint[1]) {
            if (point[1] >= lPoint[1]) {
              removed.push(point);
              this.points = this.points.filter(p => Vect.equals(p, point));
            }
          } else {
            if (point[1] <= lPoint[1]) {
              removed.push(point);
              this.points = this.points.filter(p => Vect.equals(p, point));
            }
          }
        }
      }
    }

    if (removed.length > 0) this.changed = true;
    return removed;
  }
}

module.exports = Territory;
