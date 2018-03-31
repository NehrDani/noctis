#!/usr/bin/env node

const checkNodeVersion = require('../utils/checkNodeVersion')
const pkg = require('../package.json')

// We need to check the node version as soon as possible.
checkNodeVersion(pkg.engines)

const chalk = require('chalk')
const fs = require('fs-extra')
const minimist = require('minimist')
const path = require('path')
const copyTemplate = require('../utils/copyTemplate')
const createPackageJson = require('../utils/createPackageJson')
const installDependencies = require('../utils/installDependencies')
const {
  usage,
  missingProjectName,
  projectAlreadyExists,
  abortInstallation,
  success,
} = require('../utils/messages')
const shouldUseYarn = require('../utils/shouldUseYarn')

const argv = minimist(process.argv.slice(2), {
  boolean: ['help', 'version', 'use-npm'],
  alias: {
    help: 'h',
    version: 'v',
    'use-npm': 'useNpm',
  },
})

if (argv.version) {
  console.log(pkg.version)
  process.exit()
}

if (argv.help) {
  console.log(usage(pkg.name))
  process.exit()
}

const [projectName] = argv._

if (!projectName) {
  console.log(missingProjectName(pkg.name))
  process.exit(1)
}

if (fs.existsSync(projectName)) {
  console.log(projectAlreadyExists(pkg.name))
  process.exit(1)
}

const appPath = path.resolve(projectName)
const appName = path.basename(appPath)

const init = async (appPath, appName, useNpm) => {
  console.log(`Creating a new Noctis app in ${chalk.green(appPath)}.\n`)

  const useYarn = shouldUseYarn(useNpm)

  // Create the app directory...
  await fs.ensureDir(appPath)
  // and cd into it
  process.chdir(appPath)

  await createPackageJson(appPath, appName)

  console.log('Installing packages. This might take a while.')

  await installDependencies(appPath, useYarn)

  await copyTemplate(appPath, appName)

  console.log(success(appName, appPath, useYarn ? 'yarn' : 'npm'))
}

try {
  init(appPath, appName, argv.useNpm)
} catch (err) {
  console.log(abortInstallation(err))
}
