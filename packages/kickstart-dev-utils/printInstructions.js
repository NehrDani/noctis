'use strict'

const chalk = require('chalk')

const printInstructions = urls => {
  console.log(`You can now view ${chalk.bold('your app')} in the browser.\n`)

  console.log(
    `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
  )

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    )
  }

  console.log('\nNote that the development build is not optimized.\n')
}

module.exports = printInstructions
