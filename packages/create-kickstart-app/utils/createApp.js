const chalk = require('chalk')
const fs = require('fs-extra')
const ora = require('ora')
const path = require('path')
const prepare = require('./prepare')
// const install = require('./install')
const copy = require('./copy')
// const isYarnAvailable = require('./isYarnAvailable')
const {
  missingProjectName,
  projectAlreadyExists,
  abortInstallation,
  deleteProject,
} = require('./messages')

module.exports = async (name, verbose, useNpm, cmd) => {
  if (!name) {
    console.log(missingProjectName(cmd))
    process.exit(1)
  }

  if (fs.existsSync(name)) {
    console.log(projectAlreadyExists(name))
    process.exit(1)
  }

  const base = path.resolve(name)
  const appName = path.basename(base)
  // const useYarn = useNpm ? false : isYarnAvailable()
  const spinner = ora()

  try {
    console.log(`Creating a new Kickstart app in ${chalk.green(base)}.\n`)
    prepare(base, appName)

    console.log('Installing packages. This might take a while.')
    if (!verbose) {
      spinner.start()
    }
    // await install(base, verbose, useYarn)
    spinner.stop()

    await copy(base, appName)
  } catch (err) {
    spinner.stop()
    console.log(abortInstallation(err))

    // On 'exit' we will delete the target directory
    console.log(deleteProject(appName, path.resolve(base, '..')))
    process.chdir(path.resolve(base, '..'))
    fs.removeSync(base)
    console.log('Done!')
    process.exit(1)
  }
}
