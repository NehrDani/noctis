'use strict'

const { choosePort } = require('react-dev-utils/WebpackDevServerUtils')

// Checks if PORT and PORT_DEV are available and suggests alternatives if not
module.exports = async () => {
  const PORT = parseInt(process.env.PORT, 10) || 3000
  const PORT_DEV = parseInt(process.env.PORT_DEV, 10) || PORT + 1
  const HOST = process.env.HOST || '0.0.0.0'

  const actualPort = await choosePort(HOST, PORT)
  const actualPortDev = await choosePort(HOST, PORT_DEV)

  process.env.PORT = actualPort
  process.env.PORT_DEV = actualPortDev

  return { port: actualPort, portDev: actualPortDev }
}
