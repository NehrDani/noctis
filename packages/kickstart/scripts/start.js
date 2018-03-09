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
const logger = require('kickstart-dev-utils/logger')
const createCompiler = require('kickstart-dev-utils/createCompiler')
const createConfig = require('../config/createConfig')
const createDevServerConfig = require('../config/createDevServerConfig')
const paths = require('../config/paths')

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appServerJs, paths.appClientJs])) {
  process.exit(1)
}

// Tools like Cloud9 rely on this.
const port = parseInt(process.env.PORT, 10) || 3000
const host = process.env.HOST || '0.0.0.0'
const protocol = process.env.HTTPS ? 'https' : 'http'

// Optimistically, we make the console look exactly like the output of our
// FriendlyErrorsPlugin during compilation, so the user has immediate feedback.
if (isInteractive) {
  clearConsole()
}

logger.start('Compiling...')

// Create dev configs using config our factory.
const serverConfig = createConfig('node', 'dev')
const clientConfig = createConfig('web', 'dev')

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
  createDevServerConfig({ host, port, protocol })
)

// Start Webpack-dev-server
clientDevServer.listen(port + 1, err => {
  if (err) {
    logger.error(err)
  }
})
