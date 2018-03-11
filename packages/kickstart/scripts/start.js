'use strict'

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

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const fs = require('fs-extra')
const clearConsole = require('react-dev-utils/clearConsole')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils')
const logger = require('kickstart-dev-utils/logger')
const createCompiler = require('kickstart-dev-utils/createCompiler')
const createCompileState = require('kickstart-dev-utils/createCompileState')
const getServerSettings = require('kickstart-dev-utils/getServerSettings')
const createConfig = require('../config/createConfig')
const createDevServerConfig = require('../config/createDevServerConfig')
const paths = require('../config/paths')

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appServerJs, paths.appClientJs])) {
  process.exit(1)
}

const start = async () => {
  const compileState = createCompileState()

  // Get server settings
  const { protocol, host, port, portDev } = await getServerSettings()
  // Read some info of the project
  const { name: appName } = require(paths.appPackageJson)
  // Set publicPath for development server.
  // On this path we serve the compiled assets.
  const publicPath = `${protocol}://${host}:${portDev}/`
  const urls = prepareUrls(protocol, host, port)

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in trash
  fs.emptyDirSync(paths.appBuild)

  // Create dev configs using our config factory.
  const serverConfig = createConfig('node', 'dev', publicPath)
  const clientConfig = createConfig('web', 'dev', publicPath)

  if (isInteractive) {
    clearConsole()
  }

  // Initially show output so the user has immediate feedback
  logger.start('Compiling...')

  const serverCompiler = createCompiler({
    webpack,
    config: serverConfig,
    compileState,
    appName,
    urls,
  })

  // Start our server webpack instance in watch mode.
  serverCompiler.watch(
    {
      quiet: true,
    },
    () => {}
  )

  // Compile our assets with webpack
  const clientCompiler = createCompiler({
    webpack,
    config: clientConfig,
    compileState,
    appName,
    urls,
  })

  // Create a new instance of WebpackDevServer for our client assets.
  // This will actually run on a different port than the users app.
  const clientDevServer = new WebpackDevServer(
    clientCompiler,
    createDevServerConfig({ protocol, host, port: portDev })
  )

  // Start WebpackDevServer
  clientDevServer.listen(portDev, err => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }
  })
}

start()
