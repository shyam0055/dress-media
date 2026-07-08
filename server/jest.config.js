export default {
  transform: {},
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
};
