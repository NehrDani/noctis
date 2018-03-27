# babel-preset-noctis

This package includes the [Babel](https://babeljs.io) preset used by [Noctis](https://github.com/nehrdani/noctis).

## Usage in Noctis Projects

The easiest way to use this configuration is with [Noctis](https://github.com/nehrdani/noctis), which includes it by default. **You don’t need to install it separately in Noctis projects.**

## Usage Outside of Noctis

If you want to use this Babel preset in a project not built with Noctis, you can install it with following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then install babel-preset-noctis.

```sh
yarn babel-preset-noctis -D
```

Then create a file named `.babelrc` with following contents in the root folder of your project:

  ```js
  {
    "presets": ["noctis"]
  }
  ```

This preset uses the `useBuiltIns` option with [transform-object-rest-spread](http://babeljs.io/docs/plugins/transform-object-rest-spread/) and [transform-react-jsx](http://babeljs.io/docs/plugins/transform-react-jsx/), which assumes that `Object.assign` is available or polyfilled.
