'use strict'

const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('kickstart-dev-utils/FriendlyErrorsPlugin')
const paths = require('./paths')

// Webpack config factory. The magic happens here!
module.exports = (
  target = 'web',
  env = 'dev',
  publicPath = '/',
  onCompileSuccess = () => {},
) => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_PROD = env === 'prod'
  const IS_DEV = env === 'dev'

  const babelOptions = {
    babelrc: true,
    cacheDirectory: true,
    presets: [require.resolve('babel-preset-kickstart')],
  }
  const cssOptions = {
    minify: IS_DEV,
    modules: true,
    importLoaders: 1,
    localIdentName: IS_PROD
      ? '[hash:base64:7]'
      : '[path]__[name]__[local]--[hash:base64:5]',
  }
  const postCssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebook/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      autoprefixer({
        browsers: [
          'last 2 versions',
          'not ie < 11',
        ],
        flexbox: 'no-2009',
      }),
    ],
  }
  const cssLoaders = [
    IS_DEV && require.resolve('style-loader'),
    {
      loader: require.resolve(IS_NODE ? 'css-loader/locals' : 'css-loader'),
      options: cssOptions,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: postCssOptions,
    },
    require.resolve('sass-loader'),
  ].filter(Boolean)

  let config = {
    context: process.cwd(),
    target,
    devtool: 'cheap-module-source-map',
    module: {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        // Transform ES6 with Babel
        {
          test: /\.js$/,
          include: [paths.appSrc],
          use: [
            // This loader parallelizes code compilation, it is optional but
            // improves compile time on larger projects
            require.resolve('thread-loader'),
            {
              loader: require.resolve('babel-loader'),
              options: babelOptions,
            },
          ],
        },
        // CSS Modules support
        {
          test: /\s?css$/,
          exclude: [paths.appBuild],
          use: IS_PROD
            ? ExtractTextPlugin.extract({
              fallback: {
                loader: require.resolve('style-loader'),
              },
              use: cssLoaders,
            })
            : cssLoaders,
        },
      ],
    },
    plugins: [
      // This makes debugging much easier as webpack will add filenames to
      // modules.
      new webpack.NamedModulesPlugin(),
      // Prevent creating multiple chunks for the server.
      IS_NODE && new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      // Automatically start the server when done compiling.
      IS_NODE && IS_DEV && new StartServerPlugin({
        name: 'server.js',
      }),
      // Add hot module replacement
      IS_DEV && new webpack.HotModuleReplacementPlugin(),
      // Supress errors to console (we use our own logger)
      IS_DEV && new webpack.NoEmitOnErrorsPlugin(),
      // Use our own FriendlyErrorsPlugin during development.
      IS_DEV && new FriendlyErrorsPlugin({
        verbose: process.env.VERBOSE,
        target,
        onSuccess: onCompileSuccess,
      }),
    ].filter(Boolean),
  }

  if (IS_NODE) {
    // Don't forget node's __filename, and __dirname
    config.node = { console: true, __filename: true, __dirname: true }

    config.externals = [nodeExternals()]

    config.entry = [path.resolve(paths.appServerJs)]

    // Specify webpack Node.js output path and filename
    config.output = {
      path: path.resolve(paths.appServerBuild),
      publicPath,
      filename: 'server.js',
    }
  }

  if (IS_WEB && IS_DEV) {
    // Specify client entry point /src/client.js

    config.entry = {
      client: [
        // Ship a few polyfills by default.
        require.resolve('./polyfills'),
        // Include an alternative client for WebpackDevServer. A client's job is to
        // connect to WebpackDevServer by a socket and get notified about changes.
        // When you save a file, the client will either apply hot updates (in case
        // of CSS changes), or refresh the page (in case of JS changes). When you
        // make a syntax error, this client will display a syntax error overlay.
        require.resolve('kickstart-dev-utils/webpackHotDevClient'),
        path.resolve(paths.appClientJs),
      ],
    }

    // Configure client-side bundles output. Note the public path is set to 3000
    config.output = {
      path: path.resolve(paths.appClientBuild),
      publicPath,
      pathinfo: true,
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      devtoolModuleFilenameTemplate: ({ resourcePath }) =>
        path.resolve(resourcePath).replace(/\\/g, '/'),
    }
  }

  if (IS_WEB && !IS_DEV) {
    // Specify production entry point
    config.entry = {
      client: [require.resolve('./polyfills'), path.resolve(paths.appClientJs)],
    }

    // Specify the client output directory and paths.
    const filename = IS_PROD ? '[chunkhash:8]' : '[name].[chunkhash:4]'
    config.output = {
      path: path.resolve(paths.appClientBuild),
      publicPath,
      filename: `${filename}.js`,
      chunkFilename: `${filename}.chunk.js`,
    }
  }

  return config
}
