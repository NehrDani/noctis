
const chalk = require('chalk')
const { ensureDir, writeFile, existsSync } = require('fs-extra')
const path = require('path')
const isYarnAvailable = require('./isYarnAvailable')
const { missingProjectName, projectAlreadyExists } = require('./messages')

module.exports = async (name, useNpm, cmd) => {
  if (!name) {
    console.log(missingProjectName(cmd))
    process.exit(1)
  }

  if (existsSync(name)) {
    console.log(projectAlreadyExists(name))
    process.exit(1)
  }

  const base = path.resolve(name)
  const appName = path.basename(base)
  const useYarn = useNpm ? false : isYarnAvailable()
  const originalDir = process.cwd()
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  }

  console.log(`Creating a new Kickstart app in ${chalk.green(base)}`)
  await ensureDir(name)

  await writeFile(
    path.join(base, 'packageJson'),
    `${JSON.stringify(packageJson, null, 2)}\n`
  )

  process.chdir(base)

  return {
    base,
    useYarn,
    originalDir,
    appName,
  }
}
