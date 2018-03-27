const formatWebpackMessages = require('./formatWebpackMessages')

// "Compiler" is a low-level interface to Webpack.
// It lets us listen to some events and provide our own custom messages.
module.exports = (webpack, config, emitter) => {
  const compiler = webpack(config)
  const target = config.target === 'node' ? 'server' : 'client'

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" doesn't imply any errors.
  compiler.plugin('invalid', () => {
    emitter.emit('invalid', { target })
  })

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', async stats => {
    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "message" the warnings and errors
    // and present them in a readable focused way
    const { errors, warnings } = formatWebpackMessages(stats.toJson({}, true))

    emitter.emit('done', {
      target,
      errors,
      warnings,
      duration: stats.endTime - stats.startTime,
    })
  })

  return compiler
}
