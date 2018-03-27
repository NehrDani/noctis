# noctis-dev-utils

This package includes some utilities used by [Noctis](https://github.com/nehrdani/noctis).<br>

## Usage in Noctis Projects

These utilities come by default with [Noctis](https://github.com/nehrdani/noctis), which includes it by default. **You don’t need to install it separately in Noctis projects.**

## Usage Outside of Noctis

If you don’t use Noctis, or if you, you may keep using these utilities. Their development will be aligned with Noctis, so major versions of these utilities may come out relatively often. Feel free to fork or copy and paste them into your projects if you’d like to have more control over them, or feel free to use the old versions.

### Entry Points

There is no single entry point. You can only import individual top-level modules.

#### `createCompiler(webpack: Function, config: Object, emitter: EventEmitter): WebpackCompiler`

Creates a Webpack compiler instance. Takes the `require('webpack')` entry point as the first argument and the `webpack.config.js` as the second. The emitter must be an instance of `require('EventEmitter')`.
It emits some events during compilation:
- `emitter.emit('invalid', data: Object)`
```js
data = {
  target: String, // server, client
}
```
- `emitter.emit('done', data: Object)`
```js
data = {
  target: String, // server, client
  errors: Array, // array of possible compile errors
  warnings: Array, // array of possible compile warnings
  duration: Number, // how long the build take in milliseconds
}
```

#### `createServerProcess(pathToServer: String): Object`

Returns an object that contains to functions to control a forked process.
- `start`: create a forked process of the passed `pathToServer`
- `stop`: kills the forked process so it can be restarted

```js
const createServerProcess = require('noctis-dev-utils/createServerProcess')
const serverProcess = createServerProcess('../build/server')

// After compile
serverProcess.start()

// Before recompile
serverProcess.stop()
```

#### `getServerSettings(): Promise<object | null>`

Returns a Promise resolving to an object containing the `protocol`, `host` and `port` and `portDev` that are defined in the `process.env` or the ports selected by the prompt if the user confirms it is okay to do. If the port is taken and the user has refused to use another port, or if the terminal is not interactive and can’t present user with the choice, resolves to `null`.

```js
const getServerSettings = require('noctis-dev-utils/getServerSettings')

getServerSettings().then(settings => {
  // Do whatever you need the settings for
})
```

#### `logger`

- `logger.log(thing: any): void`: Log to console. = `console.log`
- `logger.start(text: string): void`: Log the start of a task to console
- `logger.done(text: string): void`: Log the end of task to console
- `logger.info(text: string, data: object): void`: Log information and data to console
- `logger.debug(text: string, data: object): void`: Log debug message and data to console
- `logger.warn(text: string, data: object): void`: Log a warning with message and data to console
- `logger.error(text: string, err: object): void`: Log a message and an error to console

#### `printInstructions(appName: String, urls: Object): void`

Takes a string for the `appName` to tell your name on the message. To provide the `urls` argument, use `prepareUrls()` from `require(react-dev-tools)`. Please take a look at their [documentation](https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/README.md#prepareurlsprotocol-string-host-string-port-number-object).
It prints a message to the console containing the local, and network url.

```js
const printInstructions = require('noctis-dev-utils/printInstructions')

// after compile
printInstructions('my-noctis-app', prepareUrls())
```

#### `webpackHotDevClient`

This is an alternative client for [WebpackDevServer](https://github.com/webpack/webpack-dev-server) that shows a syntax error overlay.

It currently supports only Webpack 3.x.

```js
// Webpack development config
module.exports = {
  // ...
  entry: [
    // You can replace the line below with these two lines if you prefer the
    // stock client:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    'react-dev-utils/webpackHotDevClient',
    'src/index'
  ],
  // ...
}
```
