const semver = require('semver')
const { unsupportedNodeVersion } = require('../utils/messages')

module.exports = engines => {
  const nodeVersion = engines && engines.node

  if (!nodeVersion) {
    return
  }

  if (!semver.satisfies(process.version, nodeVersion)) {
    console.error(
      unsupportedNodeVersion(process.version, semver.coerce(nodeVersion))
    )
    process.exit(1)
  }
}
