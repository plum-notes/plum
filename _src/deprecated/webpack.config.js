/*global __dirname, module*/

const path = require('path');

module.exports = {
  entry: './_src/entryOverride.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [
            /node_modules/,
            path.resolve(__dirname, "_src/tests/"),
            path.resolve(__dirname, "/_src/tests/"),
            path.resolve(__dirname, "_src/tests")
          ],
      },
    ],
  },
//   node: {
//       'fs': 'empty'
//   },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  
};