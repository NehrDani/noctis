'use strict'

const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const clearConsole = require('react-dev-utils/clearConsole')
const printInstructions = require('kickstart-dev-utils/printInstructions')
const logger = require('./logger')

const isInteractive = process.stdout.isTTY

// "Compiler" is a low-level interface to Webpack.
// It lets us listen to some events and provide our own custom messages.
const createCompiler = ({ webpack, config, compileState, appName, urls }) => {
  try {
    const compiler = webpack(config)

    if (compileState) {
      // "invalid" event fires when you have changed a file, and Webpack is
      // recompiling a bundle. WebpackDevServer takes care to pause serving the
      // bundle, so if you refresh, it'll wait instead of serving the old one.
      // "invalid" doesn't imply any errors.
      compiler.plugin('invalid', () => {
        compileState.isDone(false)

        if (compileState.isInvalid()) {
          return
        }

        if (isInteractive) {
          clearConsole()
        }

        logger.start('Compiling...')
        compileState.isInvalid(true)
      })

      // "done" event fires when Webpack has finished recompiling the bundle.
      // Whether or not you have warnings or errors, you will get this event.
      compiler.plugin('done', stats => {
        compileState.isInvalid(false)

        if (compileState.isDone()) {
          return
        }

        // We have switched off the default Webpack output in WebpackDevServer
        // options so we are going to "massage" the warnings and errors
        // and present them in a readable focused way
        const { errors, warnings } = formatWebpackMessages(
          stats.toJson({}, true)
        )

        // If errors exist, only show errors.
        if (errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          const [error] = errors
          logger.error('Failed to compile.', error)
          return
        }

        // Show warnings if no errors were found.
        if (warnings.length) {
          logger.warn('Compiled with warnings.', warnings.join('\n\n'))
          return
        }

        if (isInteractive) {
          clearConsole()
        }

        logger.done('Compiled sucessfully!')
        compileState.isDone(true)

        printInstructions(appName, urls)
      })
    }

    return compiler
  } catch (err) {
    logger.error('Failed to compile.', err.message || err)
    process.exit(1)
  }
}

module.exports = createCompiler
