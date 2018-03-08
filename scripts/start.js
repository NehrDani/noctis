'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const createConfig = require('../config/createConfig')
const createDevServerConfig = require('../config/createDevServerConfig')
const logger = require('../dev-utils/logger')
const createCompiler = require('../dev-utils/createCompiler')

const isInteractive = process.stdout.isTTY

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

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
const clientDevServer = new WebpackDevServer(clientCompiler, createDevServerConfig())

// Start Webpack-dev-server
clientDevServer.listen(
  DEFAULT_PORT + 1,
  err => {
    if (err) {
      logger.error(err)
    }
  }
)
