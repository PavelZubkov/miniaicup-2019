const readline = require('readline');
const Strategy = require('./Strategy');
const Simple = require('./brains/Simple');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let strategy;
rl.on('line', line => {
  const { type, params } = JSON.parse(line);

  switch (type) {
    case 'start_game':
      strategy = new Strategy([Simple]);
      return strategy.startGame(params);
    case 'end_game':
      return strategy.endGame(params);
    default:
      strategy.update(params);
  }
  const output = strategy.getCommand();
  console.log(JSON.stringify({ command: output, debug: output }));
});
