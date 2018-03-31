const { red, cyan, green } = require('chalk')

const unsupportedNodeVersion = (current, needed) =>
  red(`
You are running Node ${current}.
Noctis requires Node v${needed.version} or higher.
Please update your version of Node.
`)

const usage = script => `
  Usage: ${script} ${green('<project-name>')} [options]

  Options:

    -v, --version  output the version number
    --verbose      print additional logs
    --use-npm      use ${cyan('npm')} even though ${cyan('yarn')} is available
    -h, --help     output usage information

  Only ${green('<project-name>')} is required.
`

const missingProjectName = script => `
Please specify the project directory:
  ${cyan(script)} ${green('<project-directory>')}

For Example:
  ${cyan(script)} ${green('my-noctis-app')}

Run ${cyan(`${script} --help`)} to see all options.
`

const projectAlreadyExists = name => `
Uh oh! Looks like there's already a project called ${red(name)}.
Please try a different name or delete it.
`

const installDependencies = deps =>
  `Installing ${deps
    .slice(0, -1)
    .map(dep => cyan(dep))
    .join(', ')} and ${cyan(deps.slice(-1))}...`

const abortInstallation = err => `
${red('Aborting installation.')}
${err.message || err}
`

const success = (appName, appPath, cmd) => `
Success! Created ${appName} at ${appPath}
Inside that directory, you can run several commands:

${cyan(`  ${cmd} start`)}
    Runs the app in development mode.

${cyan(`  ${cmd} ${cmd === 'npm' ? '' : 'run'} build`)}
    Bundles the app into static files for production.

${cyan(`  ${cmd} test`)}
    Starts the jest test runner.

We suggest that you begin by typing:
${cyan('  cd')} ${appName}
${cyan(`  ${cmd} start`)}

Happy hacking!
`

module.exports = {
  unsupportedNodeVersion,
  usage,
  missingProjectName,
  projectAlreadyExists,
  installDependencies,
  abortInstallation,
  success,
}
