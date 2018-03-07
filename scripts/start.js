'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development'

const webpack = require('webpack')
const createConfig = require('../config/createConfig')

const createCompiler = (webpack, config) => {
  try {
    return webpack(config)
  } catch (err) {
    console.log('Failed to compile.')
    process.exit(1)
  }
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

console.log('Compiling...')

// Create dev configs using config factory.
const serverConfig = createConfig('node', process.env.NODE_ENV, {})

// Create compilers
const serverCompiler = createCompiler(webpack, serverConfig)

// Start server webpack instance in watch mode.
// Error handling is done inside the compiler instance
serverCompiler.watch({
  quiet: true
}, () => {})
