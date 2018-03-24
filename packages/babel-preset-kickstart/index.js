// This is similar to how `env` works in Babel:
// https://babeljs.io/docs/usage/babelrc/#env-option
// We are not using `env` because it’s ignored in versions > babel-core@6.10.4:
// https://github.com/babel/babel/issues/4539
// https://github.com/facebook/create-react-app/issues/720
// It’s also nice that we can enforce `NODE_ENV` being specified.
const isEnv = env => ['development', 'test', 'production'].includes(env)
const ENV = process.env.BABEL_ENV || process.env.NODE_ENV
if (!isEnv(ENV)) {
  throw new Error(
    'Using `babel-preset-kickstart-app` requires that you specify `NODE_ENV` or ' +
      '`BABEL_ENV` environment variables. Valid values are "development", ' +
      '"test", and "production". Instead, received: ' +
      JSON.stringify(ENV) +
      '.'
  )
}

const IS_TEST = ENV === 'test'
const IS_PROD = ENV === 'production'

const plugins = [
  // class { handleClick = () => { } }
  require.resolve('babel-plugin-transform-class-properties'),
  // The following two plugins use Object.assign directly, instead of Babel's
  // extends helper. Note that this assumes `Object.assign` is available.
  // { ...todo, completed: true }
  [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    {
      useBuiltIns: true,
    },
  ],
  // Transforms JSX
  [
    require.resolve('babel-plugin-transform-react-jsx'),
    {
      useBuiltIns: true,
    },
  ],
  // Polyfills the runtime needed for async/await and generators
  [
    require.resolve('babel-plugin-transform-runtime'),
    {
      helpers: false,
      polyfill: false,
      regenerator: true,
    },
  ],
  // function* () { yield 42; yield 43; }
  [
    require.resolve('babel-plugin-transform-regenerator'),
    {
      // Async functions are converted to generators by babel-preset-env
      async: false,
    },
  ],
  // Adds syntax support for import()
  require.resolve('babel-plugin-syntax-dynamic-import'),
  // The following two plugins are currently necessary to make React warnings
  // include more valuable information. They are included here because they are
  // currently not enabled in babel-preset-react. See the below threads for more info:
  // https://github.com/babel/babel/issues/4702
  // https://github.com/babel/babel/pull/3540#issuecomment-228673661
  // https://github.com/facebook/create-react-app/issues/989
  !IS_PROD &&
    // Adds component stack to warning messages
    require.resolve('babel-plugin-transform-react-jsx-source'),
  !IS_PROD &&
    // Adds __self attribute to JSX which React will use for some warnings
    require.resolve('babel-plugin-transform-react-jsx-self'),
  IS_TEST &&
    // Compiles import() to a deferred require()
    require.resolve('babel-plugin-dynamic-import-node'),
  IS_PROD && [
    // Remove PropTypes from production build
    require.resolve('babel-plugin-transform-react-remove-prop-types'),
    {
      removeImport: true,
    },
  ],
].filter(Boolean)

const presets = [
  // Latest stable ECMAScript features and useres Node version
  [
    require.resolve('babel-preset-env'),
    {
      targets: {
        node: 'current',
        browsers: ['last 2 versions', 'not ie < 11'],
        // We currently minify with uglify
        // Remove after https://github.com/mishoo/UglifyJS2/issues/448
        uglify: true,
      },
      // Disable polyfill transforms
      useBuiltIns: false,
      // Do not transform modules to CJS
      modules: false,
    },
  ],
  // JSX, Flow
  require.resolve('babel-preset-react'),
].filter(Boolean)

module.exports = {
  presets,
  plugins,
}
