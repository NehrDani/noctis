'use strict'

const chalk = require('chalk')
const logger = require('./logger')

const printInstructions = (appName, urls) => {
  console.log(`You can now view ${chalk.bold(appName)} in the browser.\n`)

  console.log(
    `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
  )

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    )
  }

  console.log()
  logger.info('Note that the development build is not optimized.\n')
}

module.exports = printInstructions
