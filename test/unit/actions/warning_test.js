// var jsdom = require('mocha-jsdom')
const assert = require('assert')
const freeze = require('deep-freeze-strict')

import * as actions from '../../../ui/app/actions'
import rootReducer from '../../../ui/app/reducers'

describe('action DISPLAY_WARNING', function () {
  it('sets appState.warning to provided value', function () {
    const initialState = {
      appState: {},
    }
    freeze(initialState)

    const warningText = 'This is a sample warning message'

    const action = actions.displayWarning(warningText)
    const resultingState = rootReducer(initialState, action)

    assert.equal(resultingState.appState.warning, warningText, 'warning text set')
  })
})
