const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'scalextric.js',
    library: 'Scalextric',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this', // https://stackoverflow.com/a/64639975/209184
  },
  plugins: [new ESLintPlugin({
    context: 'src',
    extensions: ['js', 'ts']
  })],
};