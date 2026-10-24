import { createRequire } from 'node:module';
import { defineConfig } from '@rslib/core';

const require = createRequire(import.meta.url);

export default defineConfig({
  source: { tsconfigPath: './tsconfig.json' },
  output: { target: 'web', cleanDistPath: false },
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: 'es2018',
      dts: false,
      source: {
        entry: { index: ['./src/**/*.ts', '!./src/**/__tests__/**', '!./src/tests/**'] },
      },
      output: { distPath: './dist/esm' },
    },
    {
      format: 'umd',
      umdName: 'PublicSquare',
      syntax: 'es2019',
      dts: false,
      source: {
        entry: { index: './src/index.ts' },
        include: [/node_modules[\\/]@basis-theory[\\/]web-threeds/],
      },
      output: {
        distPath: './dist',
        filename: { js: 'publicsquare-js.bundle.js' },
        minify: true,
      },
      tools: {
        rspack: {
          output: {
            globalObject: "(typeof self !== 'undefined' ? self : this)",
            library: { export: '_instance' },
          },
          resolve: {
            fallback: {
              crypto: false,
              stream: false,
              os: require.resolve('os-browserify/browser'),
              process: false,
            },
          },
        },
      },
    },
  ],
});
