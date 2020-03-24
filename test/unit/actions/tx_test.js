const assert = require('assert')

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const actions = require('../../../ui/app/actions')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('tx confirmation screen', function () {
  const txId = 1457634084250832
  const initialState = {
    appState: {
      currentView: {
        name: 'confTx',
      },
    },
    metamask: {
      unapprovedTxs: {
        [txId]: {
          id: txId,
          status: 'unconfirmed',
          time: 1457634084250,
        },
      },
    },
  }

  const store = mockStore(initialState)

  describe('cancelTx', function () {
    it('creates COMPLETED_TX with the cancelled transaction ID', function (done) {
      actions._setBackgroundConnection({
        approveTransaction (_txId, cb) {
          cb('An error!')
        },
        cancelTransaction (_txId, cb) {
          cb()
        },
        clearSeedWordCache (cb) {
          cb()
        },
        getState (cb) {
          cb()
        },
      })
      store.dispatch(actions.cancelTx({ id: txId }))
        .then(() => {
          const storeActions = store.getActions()
          const completedTxAction = storeActions.find(({ type }) => type === actions.COMPLETED_TX)
          assert.equal(completedTxAction.value, txId)
          done()
        })
    })
  })
})
