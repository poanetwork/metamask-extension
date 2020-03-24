const assert = require('assert')
const freeze = require('deep-freeze-strict')

const actions = require('../../../ui/app/actions')
const reducers = require('../../../ui/app/reducers')

describe('SET_ACCOUNT_LABEL', function () {
  it('updates the state.metamask.identities[:i].name property of the state to the action.value.label', function () {
    const initialState = {
      metamask: {
        identities: {
          foo: {
            name: 'bar',
          },
        },
      },
    }
    freeze(initialState)

    const action = {
      type: actions.SET_ACCOUNT_LABEL,
      value: {
        account: 'foo',
        label: 'baz',
      },
    }
    freeze(action)

    const resultingState = reducers(initialState, action)
    assert.equal(resultingState.metamask.identities.foo.name, action.value.label)
  })
})

