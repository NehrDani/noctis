// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('../config/env')

const EventEmitter = require('events')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const fs = require('fs-extra')
const clearConsole = require('noctis-dev-utils/clearConsole')
const checkRequiredFiles = require('noctis-dev-utils/checkRequiredFiles')
const prepareUrls = require('noctis-dev-utils/prepareUrls')
const logger = require('noctis-dev-utils/logger')
const createCompiler = require('noctis-dev-utils/createCompiler')
const getServerSettings = require('noctis-dev-utils/getServerSettings')
const printInstructions = require('noctis-dev-utils/printInstructions')
const createServerProcess = require('noctis-dev-utils/createServerProcess')
const createState = require('noctis-dev-utils/createState')
const createConfig = require('../config/createConfig')
const createDevServerConfig = require('../config/createDevServerConfig')
const paths = require('../config/paths')

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.serverSrc, paths.clientSrc])) {
  process.exit(1)
}

const start = async () => {
  if (isInteractive) {
    clearConsole()
  }

  logger.info('Starting the development build.\n')
  logger.start('Compiling server...')
  logger.start('Compiling client...')

  // Get server settings
  const { protocol, host, port, portDev } = await getServerSettings()
  // Read some info of the project
  const { name: appName } = require(paths.appPackageJson)
  // Set publicPath for development server.
  // On this path we serve the compiled assets.
  const publicPath = `${protocol}://${host}:${portDev}/`
  const urls = prepareUrls(protocol, host, port)

  // This is our server process. Here we can start an stop the server
  // due to the appropiate event.
  const serverProcess = createServerProcess(
    path.resolve(paths.serverBuild, 'server.js')
  )

  // We create the state here to be used in conunction with the eventEmitter.
  const {
    isDone,
    isInvalid,
    hasChanged,
    setDone,
    unsetDone,
    setInvalid,
    unsetInvalid,
  } = createState()

  // We use the same eventEmitter on both builds. In addition with
  // controlled compilerStates we are able to check the state of
  // both compilers when one of them fires an event. This allows us to
  // wait for both compilations to finish before sending the instructions.
  const emitter = new EventEmitter()

  emitter.on('invalid', ({ target }) => {
    unsetDone(target)

    // Clear console if one build gets invalid.
    if (!isInvalid('server') && !isInvalid('client') && isInteractive) {
      clearConsole()
    }

    // Stopping server while recompiling.
    if (target === 'server') {
      serverProcess.stop()
    }

    logger.start(`Compiling ${target}...`)
    setInvalid(target)
  })

  emitter.on('done', async ({ target, warnings, errors }) => {
    // Clear console if one build has changes.
    if (hasChanged('server') && hasChanged('client') && isInteractive) {
      clearConsole()
    }

    // If errors exist, only show errors.
    if (errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      const [error] = errors
      return logger.error(`Failed to compile ${target}.`, error)
    }

    // Show warnings if no errors were found.
    if (warnings.length) {
      return logger.warn(
        `Compiled ${target} with warnings.`,
        warnings.join('\n\n')
      )
    }

    // Restart the server after compiling is done.
    if (target === 'server') {
      serverProcess.start()
    }

    logger.done(`Compiled ${target} sucessfully!`)
    setDone(target)

    // We print the instructions only if both compilers were sucessfully.
    if (isDone('server') && isDone('client')) {
      printInstructions(appName, urls)

      // We need to unset the invalid state here to not run out of sync
      // if only one build changes. This resets the hasChanged state.
      unsetInvalid('server')
      unsetInvalid('client')
    }
  })

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in trash
  fs.emptyDirSync(paths.appBuild)

  // Merge with public folder.
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
  })

  // Create dev configs using our config factory.
  const serverConfig = createConfig('node', 'dev', publicPath)
  const clientConfig = createConfig('web', 'dev', publicPath)

  // Now create the compilers and pass in the emitter in order to listen
  // for state changes.
  const serverCompiler = createCompiler(webpack, serverConfig, emitter)
  const clientCompiler = createCompiler(webpack, clientConfig, emitter)

  // We use the watch mode for the server. Webpack will listen to file changes
  // and trigger a recompile. Assets are saved in the server build directory.
  serverCompiler.watch({}, () => {})

  // Create a new instance of WebpackDevServer for our client assets.
  // This will actually run on a different port than the users app.
  const clientDevServer = new WebpackDevServer(
    clientCompiler,
    createDevServerConfig({ protocol, host, port: portDev })
  )

  // Start WebpackDevServer.
  // It will serve our client assets on the specified port.
  clientDevServer.listen(portDev, err => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }
  })
}

start()
