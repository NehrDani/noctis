const path = require('path')
const fs = require('fs')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  clientBuild: resolveApp('build/client'),
  serverBuild: resolveApp('build/server'),
  appBuild: resolveApp('build'),
  appAssets: resolveApp('build/client/asset-manifest.json'),
  appPublic: resolveApp('public'),
  clientSrc: resolveApp('src/client/client.js'),
  serverSrc: resolveApp('src/server/server.js'),
  appSrc: resolveApp('src'),
  testsSetup: resolveApp('src/setupTests.js'),
  appPackageJson: resolveApp('package.json'),
  appNodeModules: resolveApp('node_modules'),
}
