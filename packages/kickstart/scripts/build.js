'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

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
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const printBuildError = require('react-dev-utils/printBuildError')
const logger = require('kickstart-dev-utils/logger')
const createCompiler = require('kickstart-dev-utils/createCompiler')
const createConfig = require('../config/createConfig')
const paths = require('../config/paths')

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appServerJs, paths.appClientJs])) {
  process.exit(1)
}

const compile = (webpack, config) => {
  // Check for CI
  const IS_CI =
    typeof process.env.CI !== 'string' ||
    process.env.CI.toLowerCase() !== 'false'

  const compiler = createCompiler(webpack, config)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const { errors, warnings } = formatWebpackMessages(
        stats.toJson({}, true)
      )

      // If errors exist, reject with exception.
      if (errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        const [error] = errors
        return reject(new Error(error))
      }

      // If CI is set handle warnigs as errors.
      if (IS_CI && warnings.length) {
        logger.warn(
          'Treating warnings as errors because process.env.CI = true.\n' +
            'Most CI servers set it automatically.'
        )

        return reject(new Error(warnings.join('\n\n')))
      }

      return resolve({
        compiler,
        stats,
        warnings,
      })
    })
  })
}

const build = async () => {
  if (isInteractive) {
    clearConsole()
  }

  logger.log('Creating an optimized production build...\n')

  const [prevServerFiles, prevClientFiles] = await Promise.all([
    measureFileSizesBeforeBuild(paths.appServerBuild),
    measureFileSizesBeforeBuild(paths.appClientBuild),
  ])

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild)

  // Paralellize compilings
  try {
    // Initially show output so the user has immediate feedback
    logger.start('Compiling...')

    const serverConfig = createConfig('node', 'prod', '/')
    const clientConfig = createConfig('web', 'prod', '/')

    const [server, client] = await Promise.all([
      compile(webpack, serverConfig),
      compile(webpack, clientConfig),
    ])

    const warnings = [...server.warnings, ...client.warnings]

    if (isInteractive) {
      clearConsole()
    }

    // Show warnings.
    if (warnings.length) {
      logger.warn('Compiled with warnings.')
      logger.log(warnings.join('\n\n'))
      return
    }

    logger.done('Compiled successfully.')

    // Print the diffrent file sizes of the client and server after build.
    logger.log('File sizes after gzip:\n')
    logger.log(chalk.bold('Server:'))
    printFileSizesAfterBuild(
      server.stats,
      prevServerFiles,
      paths.appServerBuild
    )
    logger.log(chalk.bold('Client:'))
    printFileSizesAfterBuild(
      client.stats,
      prevClientFiles,
      paths.appClientBuild
    )
  } catch (err) {
    if (isInteractive) {
      clearConsole()
    }
    logger.error(`Failed to compile server!`)
    printBuildError(err)
    process.exit(1)
  }
}

// Init production build.
build()
