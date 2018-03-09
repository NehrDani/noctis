'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('../config/env')

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const {
  choosePort,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils')
const logger = require('kickstart-dev-utils/logger')
const createCompiler = require('kickstart-dev-utils/createCompiler')
const printInstructions = require('kickstart-dev-utils/printInstructions')
const createConfig = require('../config/createConfig')
const createDevServerConfig = require('../config/createDevServerConfig')
const paths = require('../config/paths')

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appServerJs, paths.appClientJs])) {
  process.exit(1)
}

const start = async () => {
  const host = process.env.HOST || '0.0.0.0'
  const defaultPort = parseInt(process.env.PORT, 10) || 3000
  const defaultPortDev = defaultPort + 1
  const protocol = process.env.HTTPS ? 'https' : 'http'

  // We attempt to use the default port but if it is busy, we offer the user to
  // run on a different port. `choosePort()` Promise resolves to the next free port.
  const port = await choosePort(host, defaultPort)
  const portDev = await choosePort(host, defaultPortDev)

  if (!port || !portDev) {
    // We have not found a port.
    return
  }

  // We do this before importing the wepack.config.client.dev otherwise
  // PORT and PORT_DEV won't be set at new webpack.DefinePlugin(env.stringified)
  process.env.PORT = port
  process.env.PORT_DEV = portDev

  // Set publicPath for development
  const publicPath = `${protocol}://${host}:${portDev}`

  // Set callback for compile success
  const urls = prepareUrls(protocol, host, port)
  const onCompileSuccess = () => printInstructions(urls)

  // Create dev configs using config our factory.
  const serverConfig = createConfig('node', 'dev', publicPath, onCompileSuccess)
  const clientConfig = createConfig('web', 'dev', publicPath, onCompileSuccess)

  // Optimistically, we make the console look exactly like the output of our
  // FriendlyErrorsPlugin during compilation, so the user has immediate feedback.
  if (isInteractive) {
    clearConsole()
  }

  logger.start('Compiling...')

  const serverCompiler = createCompiler(webpack, serverConfig)

  // Start our server webpack instance in watch mode.
  serverCompiler.watch({
    quiet: true
  }, () => {})

  // Compile our assets with webpack
  const clientCompiler = createCompiler(webpack, clientConfig)

  // Create a new instance of Webpack-dev-server for our client assets.
  // This will actually run on a different port than the users app.
  const clientDevServer = new WebpackDevServer(
    clientCompiler,
    createDevServerConfig({ protocol, host, port: portDev })
  )

  // Start Webpack-dev-server
  clientDevServer.listen(portDev, err => {
    if (err) {
      logger.error(err)
    }
  })
}

start()
