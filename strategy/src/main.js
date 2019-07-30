const readline = require('readline');
const Strategy = require('./Strategy');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let strategy = new Strategy();
rl.on('line', line => {
  const { type, params } = JSON.parse(line);

  switch (type) {
    case 'start_game':
      return strategy.startGame(params);
    case 'end_game':
      return strategy.endGame(params);
    default:
      strategy.update(params);
  }
  const output = strategy.getCommand();
  console.log(output);
});
