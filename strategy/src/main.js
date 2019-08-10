const readline = require('readline');
const Strategy = require('./Strategy');
const Capturing = require('./brains/Capturing');
const GoStartPoint = require('./brains/GoStartPoint');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let strategy;
rl.on('line', line => {
  const { type, params } = JSON.parse(line);
  switch (type) {
    case 'start_game':
      strategy = new Strategy([Capturing, GoStartPoint]);
      return strategy.startGame(params);
    case 'end_game':
      return strategy.endGame(params);
    default:
      strategy.tickUpdate(params);
  }
  const output = strategy.getCommand();
  if (process.env.NODE_ENV !== 'production')
    console.error(
      JSON.stringify(
        {
          dir: output,
          pos: strategy.player.position.toString(),
          brain: strategy.getCurrentState() && strategy.getCurrentState().name,
        },
        null,
        2
      )
    );
  console.log(JSON.stringify({ command: output, debug: output }));
});
