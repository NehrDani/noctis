const { red, green } = require('chalk')
const { spawnSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')

const tmpDir = path.join(__dirname, '__tmp__')
const testAppDir = path.join(tmpDir, 'test-app')
const rootDir = path.resolve(__dirname, '..')
const script = path.join(
  rootDir,
  'packages/create-noctis-app/bin/createNoctisApp.js'
)

console.log(`Running E2E test ${green('create-noctis-app')}\n`)

// Prepare testing directory
fs.ensureDirSync(tmpDir)
fs.emptyDirSync(tmpDir)

process.chdir(tmpDir)

console.log(`  Testing script 'createNoctisApp'`)

const { status } = spawnSync('node', [script, 'test-app'], { stdio: 'ignore' })

// script did not run successfully
if (status !== 0) {
  console.log(red(`\n'createNoctisApp' did not run successfully.`))
  process.exit(1)
}

const checkAppDir = testAppDir => {
  const resolve = dir => path.join(testAppDir, dir)
  const checkFiles = [
    resolve('.'),
    resolve('package.json'),
    resolve('node_modules'),
    resolve('public'),
    resolve('src'),
    resolve('.gitignore'),
  ]

  return checkFiles.every(file => fs.pathExistsSync(file))
}

// Check if all worked well
console.log('  Check for existing files')
const check = checkAppDir(testAppDir)

if (!check) {
  console.log(red('Some files are missing.'))
  process.exit(1)
}

console.log(green('All tests run successfully.'))
