const io = require('./io');

const mainLoop = async input => {
  console.log(JSON.stringify(input, null, 2));
  let commands = ['left', 'right', 'up', 'down'];
  let command = commands[Math.floor(Math.random() * commands.length)];
  return { command };
};

io.init(mainLoop);
