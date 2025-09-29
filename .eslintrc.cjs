/**
 * @file ESLint 配置，统一前后端 TypeScript/JavaScript 的代码风格校验。
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['miniprogram/miniprogram_npm/**/*', 'miniprogram/node_modules/**/*'],
  rules: {},
};
