'use strict'

const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const paths = require('./paths')

// Webpack config factory. The magic happens here!
module.exports = (
  target = 'web',
  env = 'development',
  { host = 'localhost', port = 3000, protocol = 'http' }
) => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_PROD = env === 'production'
  const IS_DEV = env === 'development'

  const publicPath = IS_DEV ? `${protocol}://${host}:${port}/` : '/'

  const babelOptions = {
    babelrc: true,
    cacheDirectory: true
  }
  const cssOptions = {
    minify: IS_DEV,
    modules: true,
    importLoaders: 1,
    localIdentName: IS_DEV ? '[path]__[name]__[local]--[hash:base64:5]' : '[hash:base64:7]'
  }
  const postCssOptions = {
    ident: 'postcss',
    plugins: () => [
      autoprefixer({
        browsers: [
          'last 2 versions',
          'not ie < 11'
        ]
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
      // modules
      new webpack.NamedModulesPlugin(),
      // Prevent creating multiple chunks for the server
      IS_NODE && new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      }),
      // Automatically start the server when done compiling
      IS_NODE && IS_DEV && new StartServerPlugin({
        name: 'server.js'
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
    // Setup Webpack Dev Server on port 3000 and
    // Specify client entry point /src/client.js

    config.entry = {
      client: [
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
