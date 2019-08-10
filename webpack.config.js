module.exports = {
  target: 'node',
  entry: './strategy/src/main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  optimization: {
    minimize: false,
  },
};
