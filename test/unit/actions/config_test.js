// var jsdom = require('mocha-jsdom')
const assert = require('assert')
const freeze = require('deep-freeze-strict')

const actions = require('../../../ui/app/actions')
const reducers = require('../../../ui/app/reducers')

describe('config view actions', function () {
  const initialState = {
    metamask: {
      rpcTarget: 'foo',
      frequentRpcList: [],
    },
    appState: {
      currentView: {
        name: 'accounts',
      },
    },
  }
  freeze(initialState)

  describe('SHOW_CONFIG_PAGE', function () {
    it('should set appState.currentView.name to config', function () {
      const result = reducers(initialState, actions.showConfigPage())
      assert.equal(result.appState.currentView.name, 'config')
    })
  })

  describe('SHOW_DELETE_RPC', function () {
    it('should set appState.currentView.name to delete-rpc', function () {
      const result = reducers(initialState, actions.showDeleteRPC())
      assert.equal(result.appState.currentView.name, 'delete-rpc')
    })
  })

  describe('SET_RPC_TARGET', function () {
    it('sets the state.metamask.rpcTarget property of the state to the action.value', function () {
      const action = {
        type: actions.SET_RPC_TARGET,
        value: 'foo',
      }

      const result = reducers(initialState, action)
      assert.equal(result.metamask.provider.type, 'rpc')
      assert.equal(result.metamask.provider.rpcTarget, 'foo')
    })
  })
})
