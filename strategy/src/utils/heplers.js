const {
  UP,
  LEFT,
  RIGHT,
  DOWN,
} = require('../../../localrunnerjs/src/constants');

exports.randomInteger = (min, max) => {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
};

exports.randomChoose = choices => {
  const index = exports.randomInteger(0, choices.length - 1);
  return choices[index];
};

exports.toSmallCoors = ([x, y]) => {
  return [(x + 15) / 30, (y + 15) / 30];
};

exports.toDetailedCoors = ([x, y]) => {
  return [x * 30 - 15, y * 30 - 15];
};

exports.getObjectCoors = (...args) => {
  if (args.length === 2) {
    return { x: args[0], y: args[1] };
  }

  if (Array.isArray(args[0])) {
    return { x: args[0][0], y: args[0][1] };
  }

  return args[0];
};

exports.coorsIsEqual = (p1, p2) => {
  const coors1 = exports.getObjectCoors(p1);
  const coors2 = exports.getObjectCoors(p2);
  return coors1.x === coors2.x && coors1.y === coors2.y;
};

exports.includesPoint = (point, points) => {
  const result = points.some(p => exports.coorsIsEqual(p, point));
  return result;
};

/**
 *
 * @param point Object or Array, x or y should be undefined
 * @param points
 */
exports.includesCoordinate = (point, points) => {
  const { x, y } = exports.getObjectCoors(point);
  if (typeof x === 'undefined' && typeof y === 'undefined')
    throw new Error('Only one coordinate should be undefined');

  const [key, value] = x ? ['x', x] : ['y', y];
  for (const p of points) {
    const coord = exports.getObjectCoors(p);
    if (coord[key] === value) return true;
  }

  return false;
};

exports.sortSidePoints = (direction, points) => {
  const key = direction === UP || direction === DOWN ? 'y' : 'x';
  const func =
    direction === UP || direction === RIGHT
      ? (a, b) => b[key] - a[key]
      : (a, b) => a[key] - b[key];
  return points.sort(func);
};
