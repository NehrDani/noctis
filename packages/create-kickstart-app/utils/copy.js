const fs = require('fs-extra')
const path = require('path')

module.exports = async (appPath, appName) => {
  // Copy the files for the user
  const templatePath = path.resolve(__dirname, '../template')
  await fs.copy(templatePath, appPath)

  // Rename gitignore after the fact to prevent npm from renaming it
  // to .npmignore.
  // See: https://github.com/npm/npm/issues/1862
  await fs.move(
    path.resolve(appPath, 'gitignore'),
    path.resolve(appPath, '.gitignore')
  )
}
