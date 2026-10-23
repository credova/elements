const path = require('path');
const { rspack } = require('@rspack/core');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  target: ['web', 'es6'],
  entry: path.resolve(__dirname, 'src'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'publicsquare-js.bundle.js',
    globalObject: "(typeof self !== 'undefined' ? self : this)",
    library: {
      name: 'PublicSquare',
      type: 'umd',
      export: '_instance',
    },
  },

  resolve: {
    tsConfig: path.resolve(__dirname, 'tsconfig.json'),
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
        loader: 'builtin:swc-loader',
        options: {
          jsc: { parser: { syntax: 'typescript' }, target: 'es2019' },
        },
        type: 'javascript/auto',
      },
    ],
  },

  optimization: {
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin({ extractComments: true })],
  },

  plugins: [new Dotenv()],
};
