const chalk = require('chalk')
const { spawn } = require('child_process')
const ora = require('ora')
const { installDependencies } = require('./messages')

const dependencies = ['react', 'react-dom', 'noctis', 'express']
const spinner = ora()

module.exports = (base, useYarn) =>
  new Promise((resolve, reject) => {
    const cmd = useYarn ? 'yarnpkg' : 'npm'
    const args = useYarn
      ? ['add', ...dependencies]
      : ['install', '--save', '--loglevel', 'error', ...dependencies]

    const child = spawn(cmd, args, { stdio: 'ignore' })

    console.log(installDependencies(dependencies))

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
