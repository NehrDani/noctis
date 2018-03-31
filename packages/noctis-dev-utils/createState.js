module.exports = () => {
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

  return {
    isDone: target => states[target].done,
    isInvalid: target => states[target].invalid,
    hasChanged: target => {
      const isDone = states[target].done
      const isInvalid = states[target].invalid

      return (!isDone && isInvalid) || (isDone && !isInvalid)
    },
    setDone: target => {
      states[target].done = true
    },
    unsetDone: target => {
      states[target].done = false
    },
    setInvalid: target => {
      states[target].invalid = true
    },
    unsetInvalid: target => {
      states[target].invalid = false
    },
  }
}
