'use-strict'

// This factory provides a centralized state management for dealing with
// compiler hooks. We need this to synchronize multiple compilers.
const createCompileState = () => {
  // Some hooks are predefined.
  let state = {
    invalid: false,
    done: false,
  }

  // Return setter/getter for the states
  return {
    isInvalid: nextState => {
      state.invalid = nextState || state.invalid
      return state.invalid
    },
    isDone: nextState => {
      state.done = nextState || state.done
      return state.done
    },
  }
}

module.exports = createCompileState
