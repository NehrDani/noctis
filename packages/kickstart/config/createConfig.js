'use strict'

const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const StartServerPlugin = require('start-server-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const paths = require('./paths')
const getClientEnv = require('./env')

// Webpack config factory. The magic happens here!
module.exports = (target = 'web', env = 'dev', publicPath = '/') => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_PROD = env === 'prod'
  const IS_DEV = env === 'dev'

  const clientEnv = getClientEnv()

  const babelOptions = {
    babelrc: false,
    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true,
    presets: [require.resolve('babel-preset-kickstart')],
  }
  const cssOptions = {
    minify: IS_DEV,
    modules: true,
    importLoaders: 1,
    localIdentName: IS_PROD
      ? '[hash:base64:7]'
      : `[path]__[name]__[local]${IS_DEV ? '' : '--[hash:base64:5]'}`,
  }
  const postCssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebook/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      autoprefixer({
        browsers: ['last 2 versions', 'not ie < 11'],
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
    devtool: IS_DEV ? 'cheap-module-source-map' : 'source-map',
    bail: !IS_DEV,
    module: {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: '[name].[hash:8].[ext]',
              },
            },
            // (S)CSS Modules support
            {
              test: /\s?css$/,
              exclude: [paths.appBuild],
              use: IS_PROD
                ? ExtractTextPlugin.extract({
                  fallback: {
                    loader: require.resolve('style-loader'),
                    options: { hmr: false },
                  },
                  use: cssLoaders,
                })
                : cssLoaders,
            },
          ],
        },
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
        // "file" loader makes sure assets end up in the `build` folder.
        // When you `import` an asset, you get its filename.
        // This loader doesn't use a "test" so it will catch all modules
        // that fall through the other loaders.
        {
          loader: require.resolve('file-loader'),
          // Exclude `js` files to keep "css" loader working as it injects
          // it's runtime that would otherwise be processed through "file" loader.
          // Also exclude `html` and `json` extensions so they get processed
          // by webpacks internal loaders.
          exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
          options: {
            name: '[name].[hash:8].[ext]',
          },
        },
      ],
    },
    plugins: [
      // Prevent creating multiple chunks for the server.
      IS_NODE &&
        new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      // Automatically start the server when done compiling.
      IS_NODE &&
        IS_DEV &&
        new StartServerPlugin({
        name: 'server.js',
      }),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
      IS_WEB && new webpack.DefinePlugin(clientEnv),
      // Minify the code.
      IS_WEB &&
        !IS_DEV &&
        new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 8,
          compress: {
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: !IS_PROD,
      }),
      // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
      IS_WEB &&
        !IS_DEV &&
        new ExtractTextPlugin({
        filename: '[name].[contenthash:8].css',
      }),
      // Generate a manifest file which contains a mapping of all asset filenames
      // to their corresponding output file so that tools can pick it up without
      // having to parse `index.html`.
      IS_WEB &&
        !IS_DEV &&
        new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath,
      }),
      // Add module names to factory functions so they appear in browser profiler.
      IS_DEV && new webpack.NamedModulesPlugin(),
      // Add hot module replacement
      IS_DEV && new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      IS_DEV && new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still
      // have to restart the development server for Webpack to discover it.
      // This plugin makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebookincubator/create-react-app/issues/186
      IS_DEV && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      // Supress errors to console (we use our own logger)
      IS_DEV && new webpack.NoEmitOnErrorsPlugin(),
    ].filter(Boolean),
  }

  if (IS_NODE) {
    config.externals = [nodeExternals()]

    config.entry = [paths.appServerJs]

    // Specify webpack Node.js output path and filename
    config.output = {
      path: paths.appServerBuild,
      filename: 'server.js',
      publicPath,
    }

    // Don't forget node's __filename, and __dirname
    config.node = {
      console: true,
      __filename: true,
      __dirname: true,
    }
  }

  if (IS_WEB) {
    const filename = IS_PROD
      ? '[chunkhash:8]'
      : `[name]${IS_DEV ? '' : '.[chunkhash:4]'}`

    config.entry = {
      client: [
        // Ship a few polyfills by default:
        require.resolve('./polyfills'),
        // Include an alternative client for WebpackDevServer. A client's job is to
        // connect to WebpackDevServer by a socket and get notified about changes.
        // When you save a file, the client will either apply hot updates (in case
        // of CSS changes), or refresh the page (in case of JS changes). When you
        // make a syntax error, this client will display a syntax error overlay.
        require.resolve('kickstart-dev-utils/webpackHotDevClient'),
        // Finally, this is your app's code:
        paths.appClientJs,
        // We include the app code last so that if there is a runtime error during
        // initialization, it doesn't blow up the WebpackDevServer client, and
        // changing JS code would still trigger a refresh.
      ].filter(Boolean),
    }

    config.output = {
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: IS_DEV,
      path: paths.appClientBuild,
      filename: `${filename}.js`,
      chunkFilename: `${filename}.chunk.js`,
      publicPath,
    }

    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    config.node = {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    }
  }

  if (IS_DEV) {
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    config.performance = {
      hints: false,
    }
  }

  return config
}
