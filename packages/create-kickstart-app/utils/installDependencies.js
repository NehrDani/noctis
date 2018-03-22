const chalk = require('chalk')
const { spawn } = require('child_process')
const ora = require('ora')
const shouldUseYarn = require('./shouldUseYarn')

const dependencies = ['react', 'react-dom', '@nehrdani/kickstart', 'express']
const spinner = ora()

module.exports = (base, useNpm) =>
  new Promise((resolve, reject) => {
    const useYarn = shouldUseYarn(useNpm)
    const cmd = useYarn ? 'yarnpkg' : 'npm'
    const args = useYarn
      ? ['add', ...dependencies]
      : ['install', '--save', '--loglevel', 'error', ...dependencies]

    const child = spawn(cmd, args, { stdio: 'ignore' })

    spinner.start()

    child.on('close', code => {
      spinner.stop()

      if (code !== 0) {
        const command = `${cmd} ${args.join(' ')}`
        return reject(new Error(`  ${chalk.cyan(command)} has failed.`))
      }
      resolve()
    })
  })
