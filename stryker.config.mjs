// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  buildCommand: 'tsc -b',
  testRunner: 'command',
  coverageAnalysis: 'perTest'
}
