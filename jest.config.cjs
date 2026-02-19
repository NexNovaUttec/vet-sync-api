module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^#models/(.*)$': '<rootDir>/src/models/$1',
    '^#schemas/(.*)$': '<rootDir>/src/schemas/$1'
  },
  verbose: true
};
