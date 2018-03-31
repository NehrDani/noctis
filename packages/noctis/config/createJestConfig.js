const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const paths = require('./paths')

const printOverrideSetupFile = () => {
  console.error(
    chalk.red(`
We detected ${chalk.bold('setupTestFrameworkScriptFile')} in your package.json.

Remove it from Jest configuration, and put the initialization code in ${chalk.bold(
    'src/setupTests.js'
  )}.
This file will be loaded automatically.
    `)
  )
}

const printOverrideError = (supportedKeys, unsupportedKeys) => {
  console.error(
    chalk.red(`
Out of the box, Noctis only supports overriding these Jest options:

${supportedKeys.map(key => chalk.bold(`  \u2022 ${key}`)).join('\n')}.

These options in your package.json Jest configuration are not currently supported by Noctis:

${unsupportedKeys.map(key => chalk.bold(`  \u2022 ${key}`)).join('\n')}
    `)
  )
}

module.exports = () => {
  // Use this instead of `paths.testsSetup` to avoid using absolute paths.
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? '<rootDir>/src/setupTests.js'
    : undefined

  const config = {
    collectCoverageFrom: ['src/**/*.{js,mjs}'],
    setupFiles: [path.resolve(__dirname, 'polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,mjs}',
      '<rootDir>/src/**/?(*.)(spec|test).{js,mjs}',
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|mjs)$': path.resolve(__dirname, 'jest/babelTransform.js'),
      '^(?!.*\\.(js|mjs|json)$)': path.resolve(
        __dirname,
        'jest/fileTransform.js'
      ),
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|mjs)$'],
    moduleNameMapper: {
      '^.+\\.s?css$': 'identity-obj-proxy',
    },
    moduleFileExtensions: ['mjs', 'js', 'json', 'node'],
    rootDir: paths.appPath,
  }

  // You may override some configuration.
  const overrides = Object.assign({}, require(paths.appPackageJson).jest)

  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'resetMocks',
    'resetModules',
    'snapshotSerializers',
    'watchPathIgnorePatterns',
  ]

  const unsupportedKeys = Object.keys(overrides).filter(
    key => !supportedKeys.includes(key)
  )
  const isOverridingSetupFile = unsupportedKeys.includes(
    'setupTestFrameworkScriptFile'
  )

  if (isOverridingSetupFile) {
    printOverrideSetupFile()
    process.exit(1)
  }

  if (unsupportedKeys.length) {
    printOverrideError(supportedKeys, unsupportedKeys)
    process.exit(1)
  }

  return Object.assign({}, config, overrides)
}
