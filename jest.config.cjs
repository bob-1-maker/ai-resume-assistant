module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js'
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
  verbose: true
};
