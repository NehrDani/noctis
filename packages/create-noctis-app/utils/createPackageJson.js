const { writeFile } = require('fs-extra')
const path = require('path')

module.exports = async (appPath, appName) => {
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: {
      start: 'noctis start',
      test: 'noctis test',
      build: 'noctis build',
    },
  }

  await writeFile(
    path.join(appPath, 'package.json'),
    `${JSON.stringify(packageJson, null, 2)}\n`
  )
}
