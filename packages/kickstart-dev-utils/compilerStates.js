'use strict'

const states = {
  server: {
    invalid: false,
    done: false,
  },
  client: {
    invalid: false,
    done: false,
  },
}

const isDone = (...targets) => targets.every(target => states[target].done)
const isInvalid = (...targets) =>
  targets.every(target => states[target].invalid)
const setDone = target => {
  states[target].done = true
}
const unsetDone = target => {
  states[target].done = false
}
const setInvalid = target => {
  states[target].invalid = true
}
const unsetInvalid = target => {
  states[target].invalid = false
}

module.exports = {
  isDone,
  isInvalid,
  setDone,
  unsetDone,
  setInvalid,
  unsetInvalid,
}
