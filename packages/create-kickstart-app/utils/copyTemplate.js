const { copy, move } = require('fs-extra')
const path = require('path')

const templatePath = path.resolve(__dirname, '../template')

module.exports = async appPath => {
  // Copy the files for the user
  await copy(templatePath, appPath)

  // Rename gitignore after the fact to prevent npm from renaming it
  // to .npmignore.
  // See: https://github.com/npm/npm/issues/1862
  await move(
    path.resolve(appPath, 'gitignore'),
    path.resolve(appPath, '.gitignore')
  )
}
