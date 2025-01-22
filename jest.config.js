module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  globalTeardown: '<rootDir>/test/teardown.js',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js'
  ],
  testMatch: ['**/test/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Agregar esto para manejar módulos ES
  moduleFileExtensions: ['js', 'json', 'node'],
  // Ignorar node_modules
  transformIgnorePatterns: ['/node_modules/'],
  // Variables globales para tests
  globals: {
    __MONGOD__: null
  }
}; 