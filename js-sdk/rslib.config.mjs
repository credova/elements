import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: { tsconfigPath: './tsconfig.build.json' },
  output: { target: 'web', cleanDistPath: false },
  lib: [
    {
      format: 'cjs',
      bundle: false,
      syntax: 'es2020',
      dts: true,
      source: {
        entry: { index: ['./src/**/*.ts', '!./src/**/__tests__/**', '!./src/tests/**'] },
      },
      output: { distPath: './dist' },
    },
    {
      format: 'umd',
      umdName: 'PublicSquare',
      syntax: 'es2020',
      dts: false,
      source: {
        entry: { index: './src/index.ts' },
        include: [/node_modules[\\/]@basis-theory[\\/]web-threeds[\\/]/],
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
        },
      },
    },
  ],
});
