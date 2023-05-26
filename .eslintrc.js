module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  ignorePatterns: ['.eslintrc.js'],
  overrides: [
    {
      files: ['test/**/*.js'],
      plugins: ['ava'],
    },
  ],
};
