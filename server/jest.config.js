// @ts-check

/** @type {import('jest').Config} */
const config = {
  transform: {},
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
};

export default config;
