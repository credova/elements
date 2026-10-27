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
      source: { entry: { index: ['./src/**/*.{ts,tsx}'] } },
      output: { distPath: './dist/esm' },
    },
  ],
});
