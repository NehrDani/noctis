'use strict'

const createCompiler = (webpack, config) => {
  try {
    return webpack(config)
  } catch (err) {
    console.log('Failed to compile.')
    process.exit(1)
  }
}

module.exports = createCompiler
