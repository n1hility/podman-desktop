// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/extension.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
  },
  external: [
    '@tmpwip/extension-api',
    'node:path',
    'node:os',
    'node:fs',
    'node:child_process',
  ],
  plugins: [
    typescript(),
    commonjs({ extensions: ['.js', '.ts'] }), // the ".ts" extension is required],
    json(),
    nodeResolve({preferBuiltins: true}),
  ],
};
