const { execSync } = require('child_process')

module.exports = useNpm => {
  if (useNpm) {
    return false
  }

  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
