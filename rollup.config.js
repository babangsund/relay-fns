import babel from "rollup-plugin-babel"
import { uglify } from "rollup-plugin-uglify"
import commonjs from "rollup-plugin-commonjs"
import nodeResolve from "rollup-plugin-node-resolve"

import pkg from "./package.json"

const input = "src/index.js"
const globals = { react: "React" }
const external = Object.keys(globals).concat("@babel/runtime")

const base = {
  input,
  external
}

const output = {
  globals
}

const plugins = [
  babel({
    runtimeHelpers: true,
    exclude: "node_modules/**",
    plugins: [["@babel/transform-runtime", { useESModules: true }]]
  }),
  nodeResolve(),
  commonjs()
]

const esm = {
  ...base,
  output: {
    ...output,
    format: "esm",
    file: pkg.module
  },
  plugins: [...plugins]
}

const cjs = {
  ...base,
  output: {
    ...output,
    format: "cjs",
    file: pkg.main
  },
  plugins: [...plugins, uglify()]
}

const umd = {
  ...base,
  output: {
    ...output,
    format: "umd",
    name: "RelayFns",
    file: `dist/index.umd.${process.env.NODE_ENV}.js`
  },
  plugins: [...plugins, process.env.NODE_ENV === "production" && uglify()]
}

export default [umd, cjs, esm]
