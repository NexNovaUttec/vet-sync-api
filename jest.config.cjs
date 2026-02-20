module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^#databases/index\\.js$': '<rootDir>/src/__mocks__/databaseMock.js',
    '^#models/(.*)$': '<rootDir>/src/models/$1',
    '^#schemas/(.*)$': '<rootDir>/src/schemas/$1'
  },
  verbose: true
}
