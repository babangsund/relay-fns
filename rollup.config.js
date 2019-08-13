import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const input = 'src/index.js';
const globals = {react: 'React', 'react-relay': 'ReactRelay'};
const external = Object.keys(globals).concat('@babel/runtime');

const base = {input, external};

function makePlugins(minify, useESModules) {
  return [
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      plugins: [['@babel/transform-runtime', {useESModules}]],
    }),
    nodeResolve(),
    commonjs(),
    minify && terser(),
  ];
}
const esm = {
  ...base,
  output: {
    globals,
    format: 'esm',
    file: pkg.module,
  },
  plugins: makePlugins(false, true),
};

const cjs = {
  ...base,
  output: {
    globals,
    format: 'cjs',
    file: pkg.main,
  },
  plugins: makePlugins(true, false),
};

const umd = {
  ...base,
  output: {
    globals,
    format: 'umd',
    name: 'RelayFns',
    file: `dist/index.umd.${process.env.NODE_ENV}.js`,
  },
  plugins: makePlugins(process.env.NODE_ENV === 'production', true),
};

const bin = {
  input: './bin/enums.js',
  external: ['fs', 'yargs', 'graphql/utilities', 'graphql/type'],
  output: {
    format: 'cjs',
    banner: '#!/usr/bin/env node',
    file: pkg.bin['relay-fns-enums'],
  },
  plugins: makePlugins(true, true),
};

export default [umd, cjs, esm, bin];
