'use strict'

const clearConsole = require('react-dev-utils/clearConsole')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const logger = require('./logger')

let WEBPACK_COMPILING = false
let WEBPACK_DONE = false

// This is a custom Webpack Plugin that prints out prettier console messages
// and errors depending on webpack compiler events. It runs on the Node.js
// server webpack instance.
class WebpackErrorsPlugin {
  constructor (options = {}) {
    this.verbose = options.verbose
    this.target = options.target === 'web' ? 'CLIENT' : 'SERVER'
    this.onSuccess = options.onSuccess
  }

  apply (compiler) {
    compiler.plugin('done', stats => {
      const messages = formatWebpackMessages(stats.toJson({}, true))
      WEBPACK_COMPILING = false
      if (!messages.errors.length && !messages.warnings.length) {
        if (!WEBPACK_DONE) {
          if (!this.verbose) {
            clearConsole()
          }
          logger.done('Compiled successfully')
          WEBPACK_DONE = true

          if (this.onSuccess) {
            this.onSuccess()
          }
        }
      }

      // If errors exist, only show errors.
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        const [error] = messages.errors
        logger.error(
          `Failed to compile ${this.target} with errors`,
          error
        )
        return
      }

      // Show warnings if no errors were found.
      if (messages.warnings.length) {
        logger.warn(
          `Compiled with ${messages.warnings.length} warnings`
        )
        logger.log(messages.warnings.join('\n\n'))
      }
    })

    compiler.plugin('invalid', () => {
      WEBPACK_DONE = false
      if (!WEBPACK_COMPILING) {
        if (!this.verbose) {
          clearConsole()
        }
        logger.start('Compiling...')
        WEBPACK_COMPILING = true
      }
    })
  }
}

module.exports = WebpackErrorsPlugin
