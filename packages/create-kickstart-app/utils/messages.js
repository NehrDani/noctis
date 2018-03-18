const { red, cyan, green } = require('chalk')

exports.unsupportedNodeVersion = (current, needed) =>
  red(`
You are running Node ${current}.
Kickstart requires Node v${needed.version} or higher.
Please update your version of Node.
`)

exports.missingProjectName = cmd => `
Please specify the project directory:
  ${cyan(cmd)} ${green('<project-directory>')}

For Example:
  ${cyan(cmd)} ${green('my-kickstart-app')}

Run ${cyan(`${cmd} --help`)} to see all options.
`

exports.projectAlreadyExists = name => `
Uh oh! Looks like there's already a project called ${red(name)}.
Please try a different name or delete it.
`

exports.abortInstallation = err => `
${red('Aborting installation.')}
${err.message || err}
`

exports.deleteProject = (appName, dir) =>
  `Deleting ${cyan(`${appName}/`)} from ${cyan(dir)}`
