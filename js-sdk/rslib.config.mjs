import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: { tsconfigPath: './tsconfig.json' },
  output: { target: 'web', cleanDistPath: false },
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: 'es2020',
      dts: false,
      source: {
        entry: { index: ['./src/**/*.ts', '!./src/**/__tests__/**', '!./src/tests/**'] },
      },
      output: { distPath: './dist/esm' },
    },
    {
      format: 'umd',
      umdName: 'PublicSquare',
      syntax: 'es2020',
      dts: false,
      source: { entry: { index: './src/index.ts' } },
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
        },
      },
    },
  ],
});
