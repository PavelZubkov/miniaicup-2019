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
  return points.some(p => exports.coorsIsEqual(p, point));
};
