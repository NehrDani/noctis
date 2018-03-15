'use strict'

const states = {
  server: {
    invalid: true,
    done: false,
  },
  client: {
    invalid: true,
    done: false,
  },
}

const isDone = target => states[target].done
const isInvalid = target => states[target].invalid
const hasChanged = target =>
  (!isDone(target) && isInvalid(target)) ||
  (isDone(target) && !isInvalid(target))
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
  hasChanged,
  setDone,
  unsetDone,
  setInvalid,
  unsetInvalid,
}
