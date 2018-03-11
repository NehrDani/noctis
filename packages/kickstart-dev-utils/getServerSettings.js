'use strict'

const { choosePort } = require('react-dev-utils/WebpackDevServerUtils')

const getServerSettings = async () => {
  const host = process.env.HOST || '0.0.0.0'
  const defaultPort = parseInt(process.env.PORT, 10) || 3000
  const defaultPortDev = defaultPort + 1
  const protocol = process.env.HTTPS ? 'https' : 'http'

  // We attempt to use the default port but if it is busy, we offer the user to
  // run on a different port. `choosePort()` Promise resolves to the next free port.
  const port = await choosePort(host, defaultPort)
  const portDev = await choosePort(host, defaultPortDev)

  if (!port || !portDev) {
    // We have not found a port.
    return
  }

  // We do this before importing the wepack.config.client.dev otherwise
  // PORT and PORT_DEV won't be set at new webpack.DefinePlugin(env.stringified)
  process.env.PORT = port
  process.env.PORT_DEV = portDev

  return {
    protocol,
    host,
    port,
    portDev,
  }
}

module.exports = getServerSettings
