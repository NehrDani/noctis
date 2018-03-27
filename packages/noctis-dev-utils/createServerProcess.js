const { fork } = require('child_process')

// A simple but effective tool to handle starting, stopping and restarting
// the server in development
module.exports = pathToServer => {
  let serverProcess

  return {
    start: () => {
      serverProcess = fork(pathToServer)
    },
    stop: () => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL')
        serverProcess = null
      }
    },
  }
}
