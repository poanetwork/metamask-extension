// var jsdom = require('mocha-jsdom')
const assert = require('assert')
const freeze = require('deep-freeze-strict')

const actions = require('../../../ui/app/actions')
const reducers = require('../../../ui/app/reducers')

describe('SHOW_INFO_PAGE', function () {
  it('sets the state.appState.currentView.name property to info', function () {
    const initialState = {
      appState: {
        activeAddress: 'foo',
      },
    }
    freeze(initialState)

    const action = actions.showInfoPage()
    const resultingState = reducers(initialState, action)
    assert.equal(resultingState.appState.currentView.name, 'info')
  })
})
