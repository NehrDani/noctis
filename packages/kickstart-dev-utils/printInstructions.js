'use strict'

const chalk = require('chalk')

const printInstructions = urls => {
  console.log()
  console.log(`You can now view ${chalk.bold('your app')} in the browser.`)
  console.log()

  console.log(
    `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
  )

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    )
  }

  console.log()
  console.log('Note that the development build is not optimized.')
  console.log()
}

module.exports = printInstructions
