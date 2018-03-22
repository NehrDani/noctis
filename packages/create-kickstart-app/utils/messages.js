const { red, cyan, green } = require('chalk')

exports.unsupportedNodeVersion = (current, needed) =>
  red(`
You are running Node ${current}.
Kickstart requires Node v${needed.version} or higher.
Please update your version of Node.
`)

exports.usage = script => `
  Usage: ${script} ${green('<project-name>')} [options]

  Options:

    -v, --version  output the version number
    --verbose      print additional logs
    --use-npm      use ${cyan('npm')} even though ${cyan('yarn')} is available
    -h, --help     output usage information

  Only ${green('<project-name>')} is required.
`

exports.missingProjectName = script => `
Please specify the project directory:
  ${cyan(script)} ${green('<project-directory>')}

For Example:
  ${cyan(script)} ${green('my-kickstart-app')}

Run ${cyan(`${script} --help`)} to see all options.
`

exports.projectAlreadyExists = name => `
Uh oh! Looks like there's already a project called ${red(name)}.
Please try a different name or delete it.
`

exports.abortInstallation = err => `
${red('Aborting installation.')}
${err.message || err}
`
