const chalk = require('chalk')
const { spawn } = require('child_process')

const dependencies = ['react', 'react-dom', '@nehrdani/kickstart', 'express']

const getInstallArgs = (packages, useYarn) =>
  useYarn
    ? ['add', ...packages]
    : ['install', '--save', '--loglevel', 'error', ...packages].filter(Boolean)

module.exports = (base, verbose, useYarn) =>
  new Promise((resolve, reject) => {
    const cmd = useYarn ? 'yarnpkg' : 'npm'
    const args = getInstallArgs(dependencies, useYarn)

    const child = spawn(cmd, args, { stdio: verbose ? 'inherit' : 'ignore' })

    child.on('close', code => {
      if (code !== 0) {
        const command = `${cmd} ${args.join(' ')}`
        return reject(new Error(`  ${chalk.cyan(command)} has failed.`))
      }
      resolve()
    })
  })
