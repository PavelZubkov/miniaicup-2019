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
