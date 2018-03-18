const { ensureDirSync, writeFileSync } = require('fs-extra')
const path = require('path')

module.exports = (base, appName) => {
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: {
      start: 'kickstart start',
      build: 'kickstart build',
    },
  }

  ensureDirSync(base)

  writeFileSync(
    path.join(base, 'package.json'),
    `${JSON.stringify(packageJson, null, 2)}\n`
  )

  process.chdir(base)
}
