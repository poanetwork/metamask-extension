/* eslint-disable mocha/no-hooks-for-single-case */
// Used to inspect long objects
// util.inspect({JSON}, false, null))
// const util = require('util')
const assert = require('assert')
const sinon = require('sinon')
const clone = require('clone')
const nock = require('nock')
const fetchMock = require('fetch-mock')
const configureStore = require('redux-mock-store').default
const thunk = require('redux-thunk').default
const EthQuery = require('eth-query')
const Eth = require('ethjs')
const KeyringController = require('eth-keychain-controller')

const { createTestProviderTools } = require('../../../stub/provider')

const provider = createTestProviderTools({ scaffold: {} }).provider

const enLocale = require('../../../../app/_locales/en/messages.json')
const actions = require('../../../../ui/app/actions')
const MetaMaskController = require('../../../../app/scripts/metamask-controller')

const firstTimeState = require('../../localhostState')
const devState = require('../../../data/2-state.json')

const middleware = [thunk]
const mockStore = configureStore(middleware)

describe('Actions', function () {

  const noop = () => {}

  let background, metamaskController

  const TEST_SEED = 'debris dizzy just program just float decrease vacant alarm reduce speak stadium'
  const password = 'a-fake-password'
  const importPrivkey = '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553'

  beforeEach(async function () {


    metamaskController = new MetaMaskController({
      provider,
      keyringController: new KeyringController({}),
      showUnapprovedTx: noop,
      showUnconfirmedMessage: noop,
      encryptor: {
        encrypt: function (_password, object) {
          this.object = object
          return Promise.resolve('mock-encrypted')
        },
        decrypt: function () {
          return Promise.resolve(this.object)
        },
      },
      initState: clone(firstTimeState),
    })

    await metamaskController.createNewVaultAndRestore(password, TEST_SEED)

    await metamaskController.importAccountWithStrategy('Private Key', [ importPrivkey ])

    background = metamaskController.getApi()

    actions._setBackgroundConnection(background)

    global.ethQuery = new EthQuery(provider)
  })

  describe('#tryUnlockMetamask', function () {

    let submitPasswordSpy, verifySeedPhraseSpy

    afterEach(function () {
      submitPasswordSpy.restore()
      verifySeedPhraseSpy.restore()
    })

    it('', async function () {

      const store = mockStore({})

      submitPasswordSpy = sinon.spy(background, 'submitPassword')
      verifySeedPhraseSpy = sinon.spy(background, 'verifySeedPhrase')

      store.dispatch(actions.tryUnlockMetamask())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert(verifySeedPhraseSpy.calledOnce)
        })
    })

    it('errors on submitPassword will fail', function () {

      const store = mockStore({})

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UNLOCK_IN_PROGRESS' },
        { type: 'UNLOCK_FAILED', value: 'error in submitPassword' },
        { type: 'HIDE_LOADING_INDICATION' },
      ]


      submitPasswordSpy = sinon.stub(background, 'submitPassword')

      submitPasswordSpy.callsFake((_password, _hdPath, callback) => {
        callback(new Error('error in submitPassword'))
      })

      return store.dispatch(actions.tryUnlockMetamask('test'))
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('displays warning error and unlock failed when verifySeed fails', function () {
      const store = mockStore({})
      const displayWarningError = [ { type: 'DISPLAY_WARNING', value: 'error' } ]
      const unlockFailedError = [ { type: 'UNLOCK_FAILED', value: 'error' } ]

      verifySeedPhraseSpy = sinon.stub(background, 'verifySeedPhrase')
      verifySeedPhraseSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.tryUnlockMetamask('test', `m/44'/60'/0'/0`))
        .catch(() => {
          const actions = store.getActions()
          const warning = actions.filter((action) => action.type === 'DISPLAY_WARNING')
          const unlockFailed = actions.filter((action) => action.type === 'UNLOCK_FAILED')
          assert.deepEqual(warning, displayWarningError)
          assert.deepEqual(unlockFailed, unlockFailedError)
        })
    })
  })

  describe('#confirmSeedWords', function () {

    let clearSeedWordCacheSpy

    afterEach(function () {
      clearSeedWordCacheSpy.restore()
    })

    it('shows account page after clearing seed word cache', function () {

      const store = mockStore({})

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SHOW_ACCOUNTS_PAGE' },
      ]

      clearSeedWordCacheSpy = sinon.spy(background, 'clearSeedWordCache')

      return store.dispatch(actions.confirmSeedWords())
        .then(() => {
          assert.equal(clearSeedWordCacheSpy.callCount, 1)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('errors in callback will display warning', function () {
      const store = mockStore({})

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      clearSeedWordCacheSpy = sinon.stub(background, 'clearSeedWordCache')

      clearSeedWordCacheSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.confirmSeedWords())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#createNewVaultAndRestore', function () {

    let createNewVaultAndRestoreSpy, clearSeedWordCacheSpy

    afterEach(function () {
      createNewVaultAndRestoreSpy.restore()
    })

    it('clears seed words and restores new vault', function () {

      const store = mockStore({})

      createNewVaultAndRestoreSpy = sinon.spy(background, 'createNewVaultAndRestore')
      clearSeedWordCacheSpy = sinon.spy(background, 'clearSeedWordCache')
      return store.dispatch(actions.createNewVaultAndRestore())
        .then(() => {
          assert(clearSeedWordCacheSpy.calledOnce)
          assert(createNewVaultAndRestoreSpy.calledOnce)
        })
    })

    it('errors when callback in clearSeedWordCache throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      clearSeedWordCacheSpy = sinon.stub(background, 'clearSeedWordCache')
      clearSeedWordCacheSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.createNewVaultAndRestore())
        .then(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('errors when callback in createNewVaultAndRestore throws', function () {

      const store = mockStore({})

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      createNewVaultAndRestoreSpy = sinon.stub(background, 'createNewVaultAndRestore')

      createNewVaultAndRestoreSpy.callsFake((_password, _seed, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.createNewVaultAndRestore())
        .then(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#createNewVaultAndKeychain', function () {

    let createNewVaultAndKeychainSpy, placeSeedWordsSpy

    afterEach(function () {
      createNewVaultAndKeychainSpy.restore()
      placeSeedWordsSpy.restore()
    })

    it('calls createNewVaultAndKeychain and placeSeedWords in background', function () {

      const store = mockStore()

      createNewVaultAndKeychainSpy = sinon.spy(background, 'createNewVaultAndKeychain')
      placeSeedWordsSpy = sinon.spy(background, 'placeSeedWords')

      return store.dispatch(actions.createNewVaultAndKeychain())
        .then(() => {
          assert(createNewVaultAndKeychainSpy.calledOnce)
          assert(placeSeedWordsSpy.calledOnce)
        })
    })

    it('displays error and value when callback errors', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      createNewVaultAndKeychainSpy = sinon.stub(background, 'createNewVaultAndKeychain')
      createNewVaultAndKeychainSpy.callsFake((_password, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.createNewVaultAndKeychain())
        .then(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })

    })

    it('errors when placeSeedWords throws', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      placeSeedWordsSpy = sinon.stub(background, 'placeSeedWords')
      placeSeedWordsSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.createNewVaultAndKeychain())
        .then(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#requestRevealSeed 1', function () {

    let submitPasswordSpy, placeSeedWordsSpy

    afterEach(function () {
      submitPasswordSpy.restore()
    })

    it('calls submitPassword and placeSeedWords from background', function () {

      const store = mockStore()

      submitPasswordSpy = sinon.spy(background, 'submitPassword')
      placeSeedWordsSpy = sinon.spy(background, 'placeSeedWords')

      return store.dispatch(actions.requestRevealSeed())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert(placeSeedWordsSpy.calledOnce)
        })
    })

    it('displays warning error with value when callback errors', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      submitPasswordSpy = sinon.stub(background, 'submitPassword')
      submitPasswordSpy.callsFake((_password, _hdPath, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.requestRevealSeed())
        .catch(() => {
          assert.deepEqual(store.getActions()[0], expectedActions[0])
          assert.deepEqual(store.getActions()[2], expectedActions[1])
        })
    })
  })

  describe('#requestRevealSeedWords', function () {
    let submitPasswordSpy

    it('calls submitPassword in background', function () {
      const store = mockStore()

      submitPasswordSpy = sinon.spy(background, 'verifySeedPhrase')

      return store.dispatch(actions.requestRevealSeedWords())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
        })
    })

    it('displays warning error message then callback in background errors', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      submitPasswordSpy = sinon.stub(background, 'verifySeedPhrase')
      submitPasswordSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.requestRevealSeedWords())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })

    })
  })

  describe('#requestRevealSeed 2', function () {

    let submitPasswordSpy, placeSeedWordsSpy

    afterEach(function () {
      submitPasswordSpy.restore()
      placeSeedWordsSpy.restore()
    })

    it('calls submitPassword and placeSeedWords in background', function () {

      const store = mockStore()

      submitPasswordSpy = sinon.spy(background, 'submitPassword')
      placeSeedWordsSpy = sinon.spy(background, 'placeSeedWords')

      return store.dispatch(actions.requestRevealSeed())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert(placeSeedWordsSpy.calledOnce)
        })
    })

    it('displays warning error message when submitPassword in background errors', function () {
      submitPasswordSpy = sinon.stub(background, 'submitPassword')
      submitPasswordSpy.callsFake((_password, _hdPath, callback) => {
        callback(new Error('error'))
      })

      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      return store.dispatch(actions.requestRevealSeed())
        .catch(() => {
          assert.deepEqual(store.getActions()[0], expectedActions[0])
          assert.deepEqual(store.getActions()[2], expectedActions[1])
        })
    })

    it('errors when placeSeedWords throw', function () {
      placeSeedWordsSpy = sinon.stub(background, 'placeSeedWords')
      placeSeedWordsSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      return store.dispatch(actions.requestRevealSeed())
        .catch(() => {
          assert.deepEqual(store.getActions()[0], expectedActions[0])
          assert.deepEqual(store.getActions()[2], expectedActions[1])
        })
    })
  })

  describe('#removeAccount', function () {
    let removeAccountSpy

    afterEach(function () {
      removeAccountSpy.restore()
    })

    it('calls removeAccount in background and expect actions to show account', function () {
      const store = mockStore(devState)
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SHOW_ACCOUNTS_PAGE' },
      ]

      removeAccountSpy = sinon.spy(background, 'removeAccount')

      return store.dispatch(actions.removeAccount('0xe18035bf8712672935fdb4e5e431b1a0183d2dfc', '1'))
        .then(() => {
          assert(removeAccountSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('displays warning error message when removeAccount callback errors', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]
      removeAccountSpy = sinon.stub(background, 'removeAccount')
      removeAccountSpy.callsFake((_address, _network, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.removeAccount('0xe18035bf8712672935fdb4e5e431b1a0183d2dfc', '1'))
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })

    })
  })

  describe('#addNewKeyring', function () {
    let addNewKeyringSpy

    beforeEach(function () {
      addNewKeyringSpy = sinon.stub(background, 'addNewKeyring')
    })

    afterEach(function () {
      addNewKeyringSpy.restore()
    })

    it('', function () {
      const privateKey = 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'

      const store = mockStore()
      store.dispatch(actions.addNewKeyring('Simple Key Pair', [ privateKey ]))
      assert(addNewKeyringSpy.calledOnce)
    })

    it('errors then addNewKeyring in background throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      addNewKeyringSpy.callsFake((_type, _opts, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.addNewKeyring())
      assert.deepEqual(store.getActions(), expectedActions)
    })

  })

  describe('#resetAccount', function () {

    let resetAccountSpy

    afterEach(function () {
      resetAccountSpy.restore()
    })

    it('resetAccount 1', function () {

      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SHOW_ACCOUNTS_PAGE' },
      ]

      resetAccountSpy = sinon.spy(background, 'resetAccount')

      return store.dispatch(actions.resetAccount())
        .then(() => {
          assert(resetAccountSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('resetAccount 2', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      resetAccountSpy = sinon.stub(background, 'resetAccount')
      resetAccountSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.resetAccount())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#importNewAccount', function () {

    let importAccountWithStrategySpy

    afterEach(function () {
      importAccountWithStrategySpy.restore()
    })

    it('calls importAccountWithStrategies in background', function () {
      const store = mockStore()

      importAccountWithStrategySpy = sinon.spy(background, 'importAccountWithStrategy')

      const importPrivkey = 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'

      return store.dispatch(actions.importNewAccount('Private Key', [ importPrivkey ]))
        .then(() => {
          assert(importAccountWithStrategySpy.calledOnce)
        })
    })

    it('displays warning error message when importAccount in background callback errors', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: 'This may take a while, please be patient.' },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      importAccountWithStrategySpy = sinon.stub(background, 'importAccountWithStrategy')
      importAccountWithStrategySpy.callsFake((_strategy, _args, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.importNewAccount())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#addNewAccount', function () {

    let addNewAccountSpy

    afterEach(function () {
      addNewAccountSpy.restore()
    })

    it('', function () {
      const store = mockStore({ metamask: devState })

      addNewAccountSpy = sinon.spy(background, 'addNewAccount')

      return store.dispatch(actions.addNewAccount())
        .then(() => {
          assert(addNewAccountSpy.calledOnce)
        })
    })
  })

  describe('#setCurrentCurrency', function () {

    let setCurrentCurrencySpy

    beforeEach(function () {
      setCurrentCurrencySpy = sinon.stub(background, 'setCurrentCurrency')
    })

    afterEach(function () {
      setCurrentCurrencySpy.restore()
    })

    it('setCurrentCurrency 1', function () {
      const store = mockStore()

      store.dispatch(actions.setCurrentCurrency('jpy'))
      assert(setCurrentCurrencySpy.calledOnce)
    })

    it('setCurrentCurrency 2', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]
      setCurrentCurrencySpy.callsFake((_currencyCode, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.setCurrentCurrency())
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  /* describe('#signMsg', () => {

    let signMessageSpy, metamaskMsgs, msgId, messages

    const msgParams = {
      from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      data: '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
    }

    beforeEach(() => {
      metamaskController.newUnsignedMessage(msgParams, noop)
      metamaskMsgs = metamaskController.messageManager.getUnapprovedMsgs()
      messages = metamaskController.messageManager.messages
      msgId = Object.keys(metamaskMsgs)[0]
      messages[0].msgParams.metamaskId = parseInt(msgId)
    })

    afterEach(() => {
      signMessageSpy.restore()
    })

    it('calls signMsg in background', () => {
      const store = mockStore()

      signMessageSpy = sinon.spy(background, 'signMessage')

      return store.dispatch(actions.signMsg(msgParams))
        .then(() => {
          assert(signMessageSpy.calledOnce)
        })

    })

    it('errors when signMessage in background throws', () => {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UPDATE_METAMASK_STATE', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      signMessageSpy = sinon.stub(background, 'signMessage')
      signMessageSpy.callsFake((msgData, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.signMsg())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

  })

  describe('#signPersonalMsg', () => {

    let signPersonalMessageSpy, metamaskMsgs, msgId, personalMessages

    const msgParams = {
      from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      data: '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
    }

    beforeEach(() => {
      metamaskController.newUnsignedPersonalMessage(msgParams, noop)
      metamaskMsgs = metamaskController.personalMessageManager.getUnapprovedMsgs()
      personalMessages = metamaskController.personalMessageManager.messages
      msgId = Object.keys(metamaskMsgs)[0]
      personalMessages[0].msgParams.metamaskId = parseInt(msgId)
    })

    afterEach(() => {
      signPersonalMessageSpy.restore()
    })

    it('', () => {
      const store = mockStore()

      signPersonalMessageSpy = sinon.spy(background, 'signPersonalMessage')

      return store.dispatch(actions.signPersonalMsg(msgParams))
        .then(() => {
          assert(signPersonalMessageSpy.calledOnce)
        })

    })

    it('', () => {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UPDATE_METAMASK_STATE', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      signPersonalMessageSpy = sinon.stub(background, 'signPersonalMessage')
      signPersonalMessageSpy.callsFake((msgData, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.signPersonalMsg(msgParams))
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

  })*/

  describe('#signTx', function () {

    let sendTransactionSpy

    beforeEach(function () {
      global.ethQuery = new EthQuery(provider)
      sendTransactionSpy = sinon.stub(global.ethQuery, 'sendTransaction')
    })

    afterEach(function () {
      sendTransactionSpy.restore()
    })

    it('calls sendTransaction in global ethQuery', function () {
      const store = mockStore()
      store.dispatch(actions.signTx())
      assert(sendTransactionSpy.calledOnce)
    })

    it('errors in when sendTransaction throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'DISPLAY_WARNING', value: 'error' },
        {
          type: 'SHOW_CONF_TX_PAGE',
          transForward: true,
          id: undefined,
          value: { isContractExecutionByUser: undefined },
        },
      ]
      sendTransactionSpy.callsFake((_txData, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.signTx())
      console.log(store.getActions())
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#signTokenTx', function () {

    let tokenSpy

    afterEach(function () {
      tokenSpy.restore()
    })

    it('', function () {
      global.eth = new Eth(provider)
      tokenSpy = sinon.spy(global.eth, 'contract')
      const store = mockStore()
      store.dispatch(actions.signTokenTx())
      assert(tokenSpy.calledOnce)
    })
  })

  describe('#lockMetamask', function () {
    let backgroundSetLockedSpy

    afterEach(function () {
      backgroundSetLockedSpy.restore()
    })

    it('', function () {
      const store = mockStore()

      backgroundSetLockedSpy = sinon.spy(background, 'setLocked')

      return store.dispatch(actions.lockMetamask())
        .then(() => {
          assert(backgroundSetLockedSpy.calledOnce)
        })
    })

    it('returns display warning error with value when setLocked in background callback errors', function () {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'LOCK_METAMASK' },
      ]
      backgroundSetLockedSpy = sinon.stub(background, 'setLocked')
      backgroundSetLockedSpy.callsFake((callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.lockMetamask())
        .then(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#setSelectedAddress', function () {
    let setSelectedAddressSpy

    beforeEach(function () {
      setSelectedAddressSpy = sinon.stub(background, 'setSelectedAddress')
    })

    afterEach(function () {
      setSelectedAddressSpy.restore()
    })

    it('calls setSelectedAddress in background', function () {
      const store = mockStore({ metamask: devState })

      store.dispatch(actions.setSelectedAddress('0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'))
      assert(setSelectedAddressSpy.calledOnce)
    })

    it('errors when setSelectedAddress throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      setSelectedAddressSpy.callsFake((_address, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.setSelectedAddress())
      assert.deepEqual(store.getActions(), expectedActions)

    })
  })

  describe('#showAccountDetail', function () {
    let setSelectedAddressSpy

    beforeEach(function () {
      setSelectedAddressSpy = sinon.stub(background, 'setSelectedAddress')
    })

    afterEach(function () {
      setSelectedAddressSpy.restore()
    })

    it('#showAccountDetail', function () {
      const store = mockStore()

      store.dispatch(actions.showAccountDetail())
      assert(setSelectedAddressSpy.calledOnce)
    })

    it('', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]
      setSelectedAddressSpy.callsFake((_address, callback) => {
        callback(new Error('error'))
      })


      store.dispatch(actions.showAccountDetail())
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#addToken', function () {
    let addTokenSpy

    beforeEach(function () {
      addTokenSpy = sinon.stub(background, 'addToken')
    })

    afterEach(function () {
      addTokenSpy.restore()
    })

    it('calls addToken in background', function () {
      const store = mockStore()

      store.dispatch(actions.addToken())
        .then(() => {
          assert(addTokenSpy.calledOnce)
        })
    })

    it('errors when addToken in background throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
      ]

      addTokenSpy.callsFake((_address, _symbol, _decimals, _image, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.addToken())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#removeToken', function () {

    let removeTokenSpy

    beforeEach(function () {
      removeTokenSpy = sinon.stub(background, 'removeToken')
    })

    afterEach(function () {
      removeTokenSpy.restore()
    })

    it('calls removeToken in background', function () {
      const store = mockStore()
      store.dispatch(actions.removeToken())
        .then(() => {
          assert(removeTokenSpy.calledOnce)
        })
    })

    it('errors when removeToken in background fails', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'UPDATE_TOKENS', newTokens: undefined },
      ]

      removeTokenSpy.callsFake((_address, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.removeToken())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#markNoticeRead', function () {
    let markNoticeReadSpy
    const notice = {
      id: 0,
      read: false,
      date: 'test date',
      title: 'test title',
      body: 'test body',
    }

    beforeEach(function () {
      markNoticeReadSpy = sinon.stub(background, 'markNoticeRead')
    })

    afterEach(function () {
      markNoticeReadSpy.restore()
    })

    it('calls markNoticeRead in background', function () {
      const store = mockStore()

      store.dispatch(actions.markNoticeRead(notice))
        .then(() => {
          assert(markNoticeReadSpy.calledOnce)
        })

    })

    it('errors when markNoticeRead in background throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]
      markNoticeReadSpy.callsFake((_notice, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.markNoticeRead())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#setProviderType', function () {
    let setProviderTypeSpy

    beforeEach(function () {
      setProviderTypeSpy = sinon.stub(background, 'setProviderType')
    })

    afterEach(function () {
      setProviderTypeSpy.restore()
    })

    it('setProviderType 1', function () {
      const store = mockStore()
      store.dispatch(actions.setProviderType())
      assert(setProviderTypeSpy.calledOnce)
    })

    it('setProviderType 2', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'DISPLAY_WARNING', value: 'Had a problem changing networks!' },
      ]

      setProviderTypeSpy.callsFake((_type, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.setProviderType())
      assert(setProviderTypeSpy.calledOnce)
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#setRpcTarget', function () {
    let setRpcTargetSpy

    beforeEach(function () {
      setRpcTargetSpy = sinon.stub(background, 'setCustomRpc')
    })

    afterEach(function () {
      setRpcTargetSpy.restore()
    })

    it('setRpcTarget 1', function () {
      const store = mockStore()
      store.dispatch(actions.setRpcTarget('http://localhost:8545'))
      assert(setRpcTargetSpy.calledOnce)
    })

    it('setRpcTarget 2', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'DISPLAY_WARNING', value: 'Had a problem changing networks!' },
      ]

      setRpcTargetSpy.callsFake((_newRpc, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.setRpcTarget())
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#addToAddressBook', function () {
    let addToAddressBookSpy

    afterEach(function () {
      addToAddressBookSpy.restore()
    })

    it('', function () {
      addToAddressBookSpy = sinon.stub(background, 'setAddressBook')
      const store = mockStore()
      store.dispatch(actions.addToAddressBook('test'))
      assert(addToAddressBookSpy.calledOnce)
    })
  })

  describe('#exportAccount', function () {
    let submitPasswordSpy, exportAccountSpy

    afterEach(function () {
      submitPasswordSpy.restore()
      exportAccountSpy.restore()
    })

    it('returns expected actions for successful action', function () {
      const store = mockStore(devState)
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SHOW_PRIVATE_KEY', value: '7ec73b91bb20f209a7ff2d32f542c3420b4fccf14abcc7840d2eff0ebcb18505' },
      ]

      submitPasswordSpy = sinon.spy(background, 'submitPassword')
      exportAccountSpy = sinon.spy(background, 'exportAccount')

      return store.dispatch(actions.exportAccount(password, '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'))
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert(exportAccountSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('returns action errors when first func callback errors', function () {
      const store = mockStore(devState)
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'Incorrect Password.' },
      ]

      submitPasswordSpy = sinon.stub(background, 'submitPassword')
      submitPasswordSpy.callsFake((_password, _hdPath, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.exportAccount(password, '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'))
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('returns action errors when second func callback errors', function () {
      const store = mockStore(devState)
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'Had a problem exporting the account.' },
      ]

      exportAccountSpy = sinon.stub(background, 'exportAccount')
      exportAccountSpy.callsFake((_address, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.exportAccount(password, '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'))
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#setAccountLabel', function () {
    let setAccountLabelSpy

    it('setAccountLabel test', function () {
      setAccountLabelSpy = sinon.stub(background, 'setAccountLabel')
      const store = mockStore()
      store.dispatch(actions.setAccountLabel('0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc', 'test'))
      assert(setAccountLabelSpy.calledOnce)
    })
  })

  describe('#pairUpdate', function () {
    afterEach(function () {
      nock.restore()
    })

    it('', function () {
      nock('https://shapeshift.io')
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get('/marketinfo/btc_eth')
        .reply(200, { pair: 'BTC_ETH', rate: 25.68289016, minerFee: 0.00176, limit: 0.67748474, minimum: 0.00013569, maxLimit: 0.67758573 })

      nock('https://shapeshift.io')
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get('/coins')
        .reply(200)
      const store = mockStore()
      // issue with dispatch action in callback not showing
      const expectedActions = [
        { type: 'SHOW_SUB_LOADING_INDICATION' },
        { type: 'HIDE_WARNING' },
      ]

      store.dispatch(actions.pairUpdate('btc'))
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#setFeatureFlag', function () {
    let setFeatureFlagSpy

    beforeEach(function () {
      setFeatureFlagSpy = sinon.stub(background, 'setFeatureFlag')
    })

    afterEach(function () {
      setFeatureFlagSpy.restore()
    })

    it('calls setFeatureFlag in the background', function () {
      const store = mockStore()

      store.dispatch(actions.setFeatureFlag())
      assert(setFeatureFlagSpy.calledOnce)
    })

    it('errors when setFeatureFlag in background throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      setFeatureFlagSpy.callsFake((_feature, _activated, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.setFeatureFlag())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#updateNetworkNonce', function () {
    let getTransactionCountSpy

    afterEach(function () {
      getTransactionCountSpy.restore()
    })

    it('updateNetworkNonce 1', function () {
      const store = mockStore()
      getTransactionCountSpy = sinon.spy(global.ethQuery, 'getTransactionCount')

      store.dispatch(actions.updateNetworkNonce())
        .then(() => {
          assert(getTransactionCountSpy.calledOnce)
        })
    })

    it('updateNetworkNonce 2', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]

      getTransactionCountSpy = sinon.stub(global.ethQuery, 'getTransactionCount')
      getTransactionCountSpy.callsFake((_address, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.updateNetworkNonce())
        .catch(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#setUseBlockie', function () {
    let setUseBlockieSpy

    beforeEach(function () {
      setUseBlockieSpy = sinon.stub(background, 'setUseBlockie')
    })

    afterEach(function () {
      setUseBlockieSpy.restore()
    })

    it('calls setUseBlockie in background', function () {
      const store = mockStore()

      store.dispatch(actions.setUseBlockie())
      assert(setUseBlockieSpy.calledOnce)
    })

    it('errors when setUseBlockie in background throws', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
        { type: 'SET_USE_BLOCKIE', value: undefined },
      ]

      setUseBlockieSpy.callsFake((_val, callback) => {
        callback(new Error('error'))
      })

      store.dispatch(actions.setUseBlockie())
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#updateCurrentLocale', function () {
    let setCurrentLocaleSpy

    beforeEach(function () {
      fetchMock.get('*', enLocale)
    })

    afterEach(function () {
      setCurrentLocaleSpy.restore()
      fetchMock.restore()
    })

    it('updateCurrentLocale 1', function () {
      const store = mockStore()
      setCurrentLocaleSpy = sinon.spy(background, 'setCurrentLocale')

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SET_CURRENT_LOCALE', value: 'en' },
        { type: 'SET_LOCALE_MESSAGES', value: enLocale },
      ]

      return store.dispatch(actions.updateCurrentLocale('en'))
        .then(() => {
          assert(setCurrentLocaleSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })

    it('updateCurrentLocale 2', function () {
      const store = mockStore()
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'DISPLAY_WARNING', value: 'error' },
      ]
      setCurrentLocaleSpy = sinon.stub(background, 'setCurrentLocale')
      setCurrentLocaleSpy.callsFake((_key, callback) => {
        callback(new Error('error'))
      })

      return store.dispatch(actions.updateCurrentLocale('en'))
        .then(() => {
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#markPasswordForgotten', function () {
    let markPasswordForgottenSpy

    afterEach(function () {
      markPasswordForgottenSpy.restore()
    })

    it('', function () {
      markPasswordForgottenSpy = sinon.stub(background, 'markPasswordForgotten')
      const store = mockStore()
      store.dispatch(actions.markPasswordForgotten())
      assert(markPasswordForgottenSpy.calledOnce)
    })
  })

  describe('#unMarkPasswordForgotten', function () {
    let unMarkPasswordForgottenSpy

    afterEach(function () {
      unMarkPasswordForgottenSpy.restore()
    })

    it('', function () {
      unMarkPasswordForgottenSpy = sinon.stub(background, 'unMarkPasswordForgotten')
      const store = mockStore()
      store.dispatch(actions.unMarkPasswordForgotten())
      assert(unMarkPasswordForgottenSpy.calledOnce)
    })
  })


})
