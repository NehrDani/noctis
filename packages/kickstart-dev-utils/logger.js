const chalk = require('chalk')

const logTypes = {
  warn: {
    bg: 'bgYellow',
    msg: ' WARNING ',
    text: 'yellow',
  },
  debug: {
    bg: 'bgMagenta',
    msg: ' DEBUG ',
    text: 'magenta',
  },
  info: {
    bg: 'bgCyan',
    msg: ' INFO ',
    text: 'cyan',
  },
  error: {
    bg: 'bgRed',
    msg: ' ERROR ',
    text: 'red',
  },
  start: {
    bg: 'bgBlue',
    msg: ' WAIT ',
    text: 'blue',
  },
  done: {
    bg: 'bgGreen',
    msg: ' DONE ',
    text: 'green',
  },
}

const write = (type, log, verbose) => {
  const { bg, text, msg } = logTypes[type]
  const textToLog = `${chalk[bg].black(msg)} ${chalk[text](log)}`

  console.log(textToLog)

  // Adds optional verbose output
  if (verbose && typeof verbose === 'object') {
    console.dir(verbose, { depth: 15 })
  } else if (verbose) {
    console.log(`\n\n${verbose}`)
  }

  // Print a new lint on type
  if (['start', 'done', 'error'].includes(type)) {
    console.log()
  }
}

// Printing any statements
const log = (text = '') => console.log(text)

// Starting a process
const start = text => {
  write('start', text)
}

// Ending a process
const done = text => {
  write('done', text)
}

// Info about a process task
const info = text => {
  write('info', text)
}

// Verbose output
// takes optional data
const debug = (text, data) => {
  write('debug', text, data)
}

// Warn output
const warn = (text, data) => {
  write('warn', text, data)
}

// Error output
// takes an optional error
const error = (text, err) => {
  write('error', text, err)
}

module.exports = {
  log,
  info,
  debug,
  warn,
  error,
  start,
  done,
}
