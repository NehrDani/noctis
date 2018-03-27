const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('noctis-dev-utils/WatchMissingNodeModulesPlugin')
const paths = require('./paths')
const getClientEnv = require('./env')

// Webpack config factory. The magic happens here!
module.exports = (target = 'web', env = 'dev', publicPath = '/') => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_PROD = env === 'prod'
  const IS_DEV = env === 'dev'

  const clientEnv = getClientEnv(publicPath)

  const babelOptions = {
    babelrc: false,
    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true,
    presets: [require.resolve('babel-preset-noctis')],
  }
  const cssOptions = {
    minify: IS_PROD,
    modules: true,
    importLoaders: 2,
    sourceMap: true,
    camelCase: 'dashes',
    localIdentName: IS_DEV ? '[name]__[local]' : '[hash:base64:8]',
  }
  const postCssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebook/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'),
      autoprefixer({
        browsers: ['last 2 versions', 'not ie < 11'],
        flexbox: 'no-2009',
      }),
    ],
  }
  // "sass-loader" processes the SCSS to return normal CSS"
  // "postcss" loader applies autoprefixer to our CSS.
  // "css" loader resolves paths in CSS and adds assets as dependencies.
  // "style" loader turns CSS into JS modules that inject <style> tags.
  const cssLoaders = [
    IS_WEB && IS_DEV && require.resolve('style-loader'),
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

  const config = {
    context: process.cwd(),
    target,
    devtool: IS_DEV ? 'cheap-module-source-map' : 'source-map',
    bail: !IS_DEV,
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules'].concat(
        // It is guaranteed to exist because we tweak it in `env.js`
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
      ),
      // These are the reasonable defaults supported by the Node ecosystem.
      extensions: ['.js', '.json'],
    },
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
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, and some ESnext features.
            {
              test: /\.js$/,
              include: [paths.appSrc],
              exclude: [/[/\\\\]node_modules[/\\\\]/],
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
            // In production, we use a plugin to extract that CSS to a file, but
            // in development "style" loader enables hot editing of CSS.
            // By default we support CSS Modules and SCSS.
            {
              test: /\s?css$/,
              exclude: [paths.appBuild],
              use:
                IS_WEB && !IS_DEV
                  ? ExtractTextPlugin.extract({
                    fallback: {
                      loader: require.resolve('style-loader'),
                      options: { hmr: false },
                    },
                    use: cssLoaders,
                  })
                  : cssLoaders,
            },
            // "file" loader makes sure assets get served by the WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // it's runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.js$/, /\.html$/, /\.json$/],
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
      new webpack.DefinePlugin(clientEnv),
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
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
      hints: IS_DEV ? false : 'warning',
    },
  }

  if (IS_NODE) {
    return Object.assign({}, config, {
      externals: [nodeExternals()],
      entry: [paths.serverSrc],
      // Specify webpack Node.js output path and filename
      output: {
        path: paths.serverBuild,
        filename: 'server.js',
        publicPath,
      },
      plugins: [
        ...config.plugins,
        // Prevent creating multiple chunks for the server.
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      ],
      node: {
        __dirname: false,
        __filename: false,
      },
    })
  }

  if (IS_WEB) {
    return Object.assign({}, config, {
      entry: {
        client: [
          // Ship a few polyfills by default:
          require.resolve('./polyfills'),
          // Include an alternative client for WebpackDevServer. A client's job is to
          // connect to WebpackDevServer by a socket and get notified about changes.
          // When you save a file, the client will either apply hot updates (in case
          // of CSS changes), or refresh the page (in case of JS changes). When you
          // make a syntax error, this client will display a syntax error overlay.
          IS_DEV && require.resolve('noctis-dev-utils/webpackHotDevClient'),
          // Finally, this is your app's code:
          paths.clientSrc,
          // We include the app code last so that if there is a runtime error during
          // initialization, it doesn't blow up the WebpackDevServer client, and
          // changing JS code would still trigger a refresh.
        ].filter(Boolean),
      },
      output: {
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: IS_DEV,
        path: paths.clientBuild,
        filename: `static/js/client${IS_DEV ? '' : '.[chunkhash:8]'}.js`,
        chunkFilename: `static/js/[name]${
          IS_DEV ? '' : '.[chunkhash:8]'
        }.chunk.js`,
        publicPath,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
          path
            .relative(paths.appSrc, info.absoluteResourcePath)
            .replace(/\\/g, '/'),
      },
      plugins: IS_DEV
        ? [
          ...config.plugins,
          // Add module names to factory functions so they appear in browser profiler.
          new webpack.NamedModulesPlugin(),
          // Add hot module replacement
          new webpack.HotModuleReplacementPlugin(),
        ]
        : [
          ...config.plugins,
          // Minify the code.
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
          new ExtractTextPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
          }),
          // Generate a manifest file which contains a mapping of all asset filenames
          // to their corresponding output file so that tools can pick it up without
          // having to parse `index.html`.
          new ManifestPlugin({
            fileName: 'asset-manifest.json',
            publicPath,
          }),
        ],
      // Some libraries import Node modules but don't use them in the browser.
      // Tell Webpack to provide empty mocks for them so importing them works.
      node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
      },
    })
  }
}
