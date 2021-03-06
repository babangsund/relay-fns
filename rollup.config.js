import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const input = 'src/index.js';
const globals = {
  react: 'React',
  'react-relay': 'ReactRelay',
  'relay-runtime': 'RelayRuntime',
};
const external = Object.keys(globals).concat('@babel/runtime');
const license = {
  output: {
    preamble: [
      '/**',
      ' * relay-fns v' + process.env.npm_package_version,
      ' *',
      ' * Copyright (c) 2019 babangsund',
      ' *',
      ' * This source code is licensed under the MIT license found in the',
      ' * LICENSE file in the root directory of this source tree.',
      ' */',
    ].join('\n'),
  },
};

const plugins = [
  babel({
    runtimeHelpers: true,
    exclude: 'node_modules/**',
    plugins: [['@babel/transform-runtime', {useESModules: true}]],
  }),
  nodeResolve(),
  commonjs(),
  process.env.NODE_ENV === 'production' && terser(license),
];

export default [
  {
    input,
    external,
    plugins,
    output: [
      {
        globals,
        format: 'esm',
        file: pkg.module,
      },
      {
        globals,
        format: 'cjs',
        file: pkg.main,
      },
      {
        globals,
        format: 'umd',
        name: 'RelayFns',
        file: `dist/index.umd.${process.env.NODE_ENV}.js`,
      },
    ],
  },
  {
    plugins,
    input: './bin/enums.js',
    external: ['fs', 'yargs', 'graphql/utilities', 'graphql/type'],
    output: {
      format: 'cjs',
      banner: '#!/usr/bin/env node',
      file: pkg.bin['relay-fns-enums'],
    },
  },
];
