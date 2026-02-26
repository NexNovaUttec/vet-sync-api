module.exports = {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^#root/config\\.js$': '<rootDir>/src/__mocks__/configMock.js',
    '^#databases/index\\.js$': '<rootDir>/src/__mocks__/databaseMock.js',
    '^#models/(.*)$': '<rootDir>/src/models/$1',
    '^#schemas/(.*)$': '<rootDir>/src/schemas/$1'
  },
  verbose: true
}
