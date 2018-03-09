'use strict'

const logger = require('./logger')

const createCompiler = (webpack, config) => {
  try {
    return webpack(config)
  } catch (err) {
    logger.error('Failed to compile.', err.message || err)
    process.exit(1)
  }
}

module.exports = createCompiler
