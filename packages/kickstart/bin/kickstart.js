#!/usr/bin/env node
'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const spawn = require('react-dev-utils/crossSpawn')

const isScript = x => ['start', 'build'].includes(x)
const [script, ...args] = process.argv.slice(2)

if (isScript(script)) {
  const { signal, status } = spawn.sync(
    'node',
    [require.resolve(`../scripts/${script}`), ...args],
    { stdio: 'inherit' }
  )

  if (signal === 'SIGKILL') {
    console.log(`
      The build failed because the process exited too early.
      This probably means the system ran out of memory or someone called 'kill -9' on the process.
    `)
    process.exit(1)
  }

  if (signal === 'SIGTERM') {
    console.log(`
      The build failed because the process exited too early.
      Someone might have called 'kill' or 'killall', or the system could be shutting down.
    `)
    process.exit(1)
  }

  process.exit(status)
}

console.log(`Unknown script "${script}".`)
process.exit(1)
