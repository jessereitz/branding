// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

const plugins = [
  resolve(),
  commonjs(),
  eslint(),
];

if (process.env.BUILDTARGET === 'PROD') {
  plugins.push(babel({
    exclude: 'node_modules/**',
    externalHelpers: true,
  }));
  plugins.push(uglify());
}

export default {
  input: 'src/index.js',
  output: {
    file: 'assets/js/rbrandlib.js',
    format: 'iife',
    name: 'WriteFree',
    sourcemap: true,
  },
  plugins,
};
