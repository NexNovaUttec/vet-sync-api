module.exports = {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['./jest.setup.cjs'],
  moduleNameMapper: {
    '^#models/(.*)$': '<rootDir>/src/models/$1',
    '^#schemas/(.*)$': '<rootDir>/src/schemas/$1'
  },
  verbose: true
}
