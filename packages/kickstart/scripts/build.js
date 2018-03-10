'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

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
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const printBuildError = require('react-dev-utils/printBuildError')
const logger = require('kickstart-dev-utils/logger')
const createCompiler = require('kickstart-dev-utils/createCompiler')
const createConfig = require('../config/createConfig')
const paths = require('../config/paths')

const isInteractive = process.stdout.isTTY

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild

// Check for CI
const IS_CI = typeof process.env.CI !== 'string' ||
  process.env.CI.toLowerCase() !== 'false'

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appServerJs, paths.appClientJs])) {
  process.exit(1)
}

const compile = (config, target = 'client') => {
  logger.start(`Compiling ${target}...`)

  const compiler = createCompiler(webpack, config)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const { errors, warnings } = formatWebpackMessages(stats.toJson({}, true))
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

      return resolve({
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

  logger.info('Creating an optimized production build...\n\n')

  // Only compare clint files, because they are critical for UX
  const prevFileSizes = await measureFileSizesBeforeBuild(paths.appClientBuild)

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild)

  // Compiling server
  try {
    const serverConfig = createConfig('node', 'prod', '/')
    const { warnings } = await compile(serverConfig, 'server')

    if (warnings.length) {
      logger.warn('Compiled with warnings.')
      logger.log(warnings.join('\n\n'))
    } else {
      logger.done('Compiled server successfully.')
    }
  } catch (err) {
    logger.error(`Failed to compile server!`)
    printBuildError(err)
    process.exit(1)
  }

  console.log()

  // Compiling client
  try {
    const clientConfig = createConfig('web', 'prod', '/')
    const { stats, warnings } = await compile(clientConfig, 'client')

    if (warnings.length) {
      logger.warn('Compiled with warnings.')
      logger.log(warnings.join('\n\n'))
    } else {
      logger.done('Compiled client successfully.')
    }

    // Print the diffrent file sizes of the client before and after.
    console.log('File sizes after gzip:\n')
    printFileSizesAfterBuild(stats, prevFileSizes, paths.appClientBuild)
  } catch (err) {
    logger.error(`Failed to compile client!`)
    printBuildError(err)
    process.exit(1)
  }
}

// Init production build.
build()
