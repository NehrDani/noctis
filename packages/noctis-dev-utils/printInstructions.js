const chalk = require('chalk')
const logger = require('./logger')

module.exports = (appName, urls) => {
  logger.log(`You can now view ${chalk.bold(appName)} in the browser.\n`)

  logger.log(
    `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
  )

  if (urls.lanUrlForTerminal) {
    logger.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    )
  }

  logger.log()
  logger.info('Note that the development build is not optimized.\n')
}
