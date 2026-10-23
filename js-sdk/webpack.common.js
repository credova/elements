const path = require('path');
const Dotenv = require('dotenv-webpack');
const { merge } = require('webpack-merge');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const base = {
  target: ['web', 'es6'],
  entry: path.resolve(__dirname, 'src'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    globalObject: "typeof self !== 'undefined' ? self : this",
  },

  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: {
      crypto: false,
      stream: false,
      os: require.resolve('os-browserify/browser'),
      process: false,
    },
  },

  module: {
    rules: [
      {
        include: [path.resolve(__dirname, 'src')],
        test: /\.(ts|js)x?$/u,
        loader: 'esbuild-loader',
        options: { target: 'es2019' },
      },
    ],
  },

  plugins: [new Dotenv()],
};

const umd = merge(base, {
  output: {
    filename: 'publicsquare-js.bundle.js',
    library: 'PublicSquare',
    libraryTarget: 'umd',
    libraryExport: '_instance',
  },
});

module.exports = [
  umd,
  // other configs like `cjs` or `esm` could go here
];