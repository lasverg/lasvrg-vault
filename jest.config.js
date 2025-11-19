// module.exports = {
//   // Use ts-jest preset for testing TypeScript files with Jest
//   preset: 'ts-jest',
//   // Set the test environment to Node.js
//   testEnvironment: 'node',

//   // Define the root directory for tests and modules
//   roots: ['<rootDir>/tests'],

//   // Use ts-jest to transform TypeScript files
//   transform: {
//     '^.+\\.tsx?$': 'ts-jest'
//   },

//   // Regular expression to find test files
//   testRegex: '((\\.|/)(test|spec))\\.tsx?$',

//   // File extensions to recognize in module resolution
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
// }

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/database',
    'src/test',
    'src/types'
  ],
  reporters: ['default' /*'jest-junit'*/],
  globals: { 'ts-jest': { diagnostics: false } },
  transform: {}
}
