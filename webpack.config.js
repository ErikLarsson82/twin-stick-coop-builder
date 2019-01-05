const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: []
  },
  devtool: "inline-source-map",
  watch: true,
  plugins: []
};