module.exports = {
  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/nodejs',
    '@metamask/eslint-config/config/jest',
  ],
  plugins: [
    'json',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  overrides: [
    {
      files: [
        'src/**/*.ts',
        'development/*.ts',
      ],
      extends: [
        '@metamask/eslint-config/config/typescript',
      ],
      env: {
        node: true,
      },
      globals: {
        snaps: true,
      },
      rules: {
        'node/no-process-exit': 'off',
      },
    },
    {
      files: [
        'src/cmds/eval/evalWorker.ts',
      ],
      globals: {
        lockdown: true,
        Compartment: true,
        BigInt: true,
      },
    },
    {
      files: [
        'src/main.ts',
      ],
      rules: {
        'node/shebang': 'off',
      },
    },
    {
      files: [
        'examples/**/*.js',
      ],
      env: {
        browser: true,
      },
      globals: {
        wallet: true,
      },
      rules: {
        'no-alert': 'off',
      },
    },
    {
      files: [
        'test/**/*.js',
      ],
      rules: {
        'node/no-callback-literal': 'off',
      },
    },
  ],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist/',
    'node_modules/',
  ],
};
