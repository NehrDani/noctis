# babel-preset-kickstart

This package includes the [Babel](https://babeljs.io) preset used by [Kickstart](https://github.com/nehrdani/kickstart).

## Usage in Kickstart Projects

The easiest way to use this configuration is with [Kickstart](https://github.com/nehrdani/kickstart), which includes it by default. **You don’t need to install it separately in Kickstart projects.**

## Usage Outside of Kickstart

If you want to use this Babel preset in a project not built with Kickstart, you can install it with following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then install babel-preset-kickstart.

```sh
yarn babel-preset-kickstart -D
```

Then create a file named `.babelrc` with following contents in the root folder of your project:

  ```js
  {
    "presets": ["kickstart"]
  }
  ```

This preset uses the `useBuiltIns` option with [transform-object-rest-spread](http://babeljs.io/docs/plugins/transform-object-rest-spread/) and [transform-react-jsx](http://babeljs.io/docs/plugins/transform-react-jsx/), which assumes that `Object.assign` is available or polyfilled.
