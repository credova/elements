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
      source: { entry: { index: ['./src/**/*.{ts,tsx}'] } },
      output: { distPath: './dist' },
    },
  ],
});
