/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    bindings: { ENVIRONMENT: 'dev' },
    scriptPath: "dist/index.js",
    modules: true
  }
};