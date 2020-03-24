// var jsdom = require('mocha-jsdom')
const assert = require('assert')
const freeze = require('deep-freeze-strict')

const actions = require('../../../ui/app/actions')
const reducers = require('../../../ui/app/reducers')

describe('SET_SELECTED_ACCOUNT', function () {
  it('sets the state.appState.activeAddress property of the state to the action.value', function () {
    const initialState = {
      appState: {
        activeAddress: 'foo',
      },
    }
    freeze(initialState)

    const action = {
      type: actions.SET_SELECTED_ACCOUNT,
      value: 'bar',
    }
    freeze(action)

    const resultingState = reducers(initialState, action)
    assert.equal(resultingState.appState.activeAddress, action.value)
  })
})

describe('SHOW_ACCOUNT_DETAIL', function () {
  it('updates metamask state', function () {
    const initialState = {
      metamask: {
        selectedAddress: 'foo',
      },
    }
    freeze(initialState)

    const action = {
      type: actions.SHOW_ACCOUNT_DETAIL,
      value: 'bar',
    }
    freeze(action)

    const resultingState = reducers(initialState, action)
    assert.equal(resultingState.metamask.selectedAddress, action.value)
  })
})
