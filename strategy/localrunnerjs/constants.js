function toInt(value, defaultValue = null) {
  const result = Number(value);
  return typeof result === 'undefined' || Number.isNaN(result)
    ? defaultValue
    : result;
}

function parseJson(value, defaultValue = null) {
  try {
    return typeof value === 'undefined' ? defaultValue : JSON.parse(value);
  } catch (ex) {
    return defaultValue;
  }
}

function getEnv(name) {
  return process.env[name];
}

exports.LEFT = 'left';
exports.RIGHT = 'right';
exports.UP = 'up';
exports.DOWN = 'down';

exports.SPEED = toInt(getEnv('SPEED'), 5);
exports.WIDTH = toInt(getEnv('WIDTH'), 30);
exports.BONUS_CHANCE = toInt(getEnv('BONUS_CHANCE'), 500);
exports.BONUSES_MAX_COUNT = toInt(getEnv('BONUSES_MAX_COUNT'), 3);
exports.Y_CELLS_COUNT = toInt(getEnv('Y_CELLS_COUNT'), 31);
exports.X_CELLS_COUNT = toInt(getEnv('X_CELLS_COUNT'), 31);

exports.NEUTRAL_TERRITORY_SCORE = toInt(getEnv('NEUTRAL_TERRITORY_SCORE'), 1);
exports.ENEMY_TERRITORY_SCORE = toInt(getEnv('ENEMY_TERRITORY_SCORE'), 5);
exports.SAW_SCORE = toInt(getEnv('SAW_SCORE'), 30);
exports.LINE_KILL_SCORE = toInt(getEnv('LINE_KILL_SCORE'), 50);
exports.SAW_KILL_SCORE = toInt(getEnv('SAW_KILL_SCORE'), 150);

exports.LR_CLIENTS_MAX_COUNT = toInt(getEnv('LR_CLIENTS_MAX_COUNT'), 6);

exports.MAX_EXECUTION_TIME = toInt(getEnv('MAX_EXECUTION_TIME'), 120);
exports.REQUEST_MAX_TIME = toInt(getEnv('REQUEST_MAX_TIME'), 5);
exports.MAX_TICK_COUNT = toInt(getEnv('MAX_TICK_COUNT'), 1500);
exports.CLIENTS_COUNT = toInt(getEnv('CLIENTS_COUNT'), 2);
exports.AVAILABLE_BONUSES = parseJson(getEnv('AVAILABLE_BONUSES'), [
  'n',
  's',
  'saw',
]);

exports.PLAYER_COLORS = [
  [90, 159, 153, 255],
  [216, 27, 96, 255],
  [96, 125, 139, 255],
  [245, 124, 0, 255],
  [92, 107, 192, 255],
  [141, 110, 99, 255],
];

exports.WINDOW_HEIGHT = exports.Y_CELLS_COUNT * exports.WIDTH;
exports.WINDOW_WIDTH = exports.X_CELLS_COUNT * exports.WIDTH;
