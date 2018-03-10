'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'productions'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('../config/env')

const webpack = require('webpack')
const fs = require('fs-extra')
const chalk = require('chalk')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const logger = require('kickstart-dev-utils/logger')
const createCompiler = require('kickstart-dev-utils/createCompiler')
const createConfig = require('../config/createConfig')
const paths = require('../config/paths')

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild

// Check for CI
const IS_CI = typeof process.env.CI !== 'string' ||
  process.env.CI.toLowerCase() !== 'false'

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appServerJs, paths.appClientJs])) {
  process.exit(1)
}

const compileClient = prevFileSizes => {
  logger.start('Compiling client...')

  const clientConfig = createConfig('web', 'prod', '/')
  const clientCompiler = createCompiler(webpack, clientConfig)

  return new Promise((resolve, reject) => {
    clientCompiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const { errors, warnings } = formatWebpackMessages(stats.json({}, true))
      if (errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        const [error] = errors
        return reject(new Error(error))
      }

      if (IS_CI && warnings.length) {
        logger.warn(
          'Treating warnings as errors because process.env.CI = true.\n' +
          'Most CI servers set it automatically.\n'
        )

        return reject(new Error(warnings.join('\n\n')))
      }
    })
  })
}
