'use strict'

const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('../dev-utils/FriendlyErrorsPlugin')
const paths = require('./paths')

const ENV = process.env
const protocol = ENV.PROTOCOL || 'http'
const host = ENV.HOST || '0.0.0.0'
const port = ENV.PORT || 3000

// Webpack config factory. The magic happens here!
module.exports = (
  target = 'web',
  env = 'dev'
) => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_PROD = env === 'prod'
  const IS_DEV = env === 'dev'

  const publicPath = IS_DEV ? `${protocol}://${host}:${port + 1}/` : '/'

  const babelOptions = {
    babelrc: true,
    cacheDirectory: true
  }
  const cssOptions = {
    minify: IS_DEV,
    modules: true,
    importLoaders: 1,
    localIdentName: IS_DEV
      ? '[path]__[name]__[local]--[hash:base64:5]'
      : '[hash:base64:7]'
  }
  const postCssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebook/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      autoprefixer({
        browsers: [
          'last 2 versions',
          'not ie < 11'
        ],
        flexbox: 'no-2009'
      })
    ]
  }
  const cssLoaders = [
    IS_DEV && require.resolve('style-loader'),
    {
      loader: require.resolve(IS_NODE ? 'css-loader/locals' : 'css-loader'),
      options: cssOptions
    },
    {
      loader: require.resolve('postcss-loader'),
      options: postCssOptions
    },
    require.resolve('sass-loader')
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
            {
              loader: require.resolve('babel-loader'),
              options: babelOptions
            }
          ]
        },
        // CSS Modules support
        {
          test: /\s?css$/,
          exclude: [paths.appBuild],
          use: IS_PROD
            ? ExtractTextPlugin.extract({
              fallback: {
                loader: require.resolve('style-loader')
              },
              use: cssLoaders
            })
            : cssLoaders
        }
      ]
    },
    plugins: [
      // This makes debugging much easier as webpack will add filenames to
      // modules.
      new webpack.NamedModulesPlugin(),
      // Prevent creating multiple chunks for the server.
      IS_NODE && new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      }),
      // Automatically start the server when done compiling.
      IS_NODE && IS_DEV && new StartServerPlugin({
        name: 'server.js'
      }),
      // Add hot module replacement
      IS_DEV && new webpack.HotModuleReplacementPlugin(),
      // Supress errors to console (we use our own logger)
      IS_DEV && new webpack.NoEmitOnErrorsPlugin(),
      // Use our own FriendlyErrorsPlugin during development.
      IS_DEV && new FriendlyErrorsPlugin({
        verbose: process.env.VERBOSE,
        target,
        onSuccessMessage: `Your application is running at ${protocol}://${host}:${port}`
      })
    ].filter(Boolean)
  }

  if (IS_NODE) {
    // Don't forget node's __filename, and __dirname
    config.node = { console: true, __filename: true, __dirname: true }

    config.externals = [nodeExternals()]

    config.entry = [path.resolve(paths.appSrc, 'server.js')]

    // Specify webpack Node.js output path and filename
    config.output = {
      path: path.resolve(paths.appBuild),
      publicPath,
      filename: 'server.js'
    }
  }

  if (IS_WEB && IS_DEV) {
    // Specify client entry point /src/client.js

    config.entry = {
      client: [
        // Include an alternative client for WebpackDevServer. A client's job is to
        // connect to WebpackDevServer by a socket and get notified about changes.
        // When you save a file, the client will either apply hot updates (in case
        // of CSS changes), or refresh the page (in case of JS changes). When you
        // make a syntax error, this client will display a syntax error overlay.
        require.resolve('../dev-utils/webpackHotDevClient'),
        path.resolve(paths.appSrc, 'client.js')
      ]
    }

    // Configure client-side bundles output. Note the public path is set to 3000
    config.output = {
      path: path.resolve(paths.appBuild),
      publicPath,
      pathinfo: true,
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      devtoolModuleFilenameTemplate: ({ resourcePath }) =>
        path.resolve(resourcePath).replace(/\\/g, '/')
    }
  }

  if (IS_WEB && IS_PROD) {
    // Specify production entry point
    config.entry = {
      client: [
        path.resolve(paths.appSrc, 'client.js')
      ]
    }

    // Specify the client output directory and paths. Notice that we have
    // changed the publiPath to just '/' from http://localhost:8080. This is because
    // we will only be using one port in production.
    config.output = {
      path: path.resolve(paths.appBuild),
      publicPath,
      filename: '[chunkhash:8].js',
      chunkFilename: '[chunkhash:8].chunk.js'
    }
  }

  return config
}
