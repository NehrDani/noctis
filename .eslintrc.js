module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'standard'
  ],
  rules: {
    'comma-dangle': ['error', {
      arrays: 'only-multiline',
      objects: 'only-multiline',
      imports: 'only-multiline',
      exports: 'only-multiline',
      functions: 'ignore'
    }]
  }
}
