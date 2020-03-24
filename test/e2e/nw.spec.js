/* eslint-disable mocha/no-async-describe */
const path = require('path')
const Func = require('./func').Functions

const account1 = '0x2E428ABd9313D256d64D1f69fe3929C3BE18fD1f'
const account1RSK = '0x7a9bc05F7441d862d1B83CB724861a9872FF43fe'
const account2 = '0xd7b7AFeCa35e32594e29504771aC847E2a803742'
const setup = require(`./test-cases/setup.spec`)
const login = require(`./test-cases/login.spec`)
const { accountCreation } = require(`./test-cases/account-creation.spec`)
const connectHDWallet = require(`./test-cases/connect-hd-wallet.spec`)
const importAccount = require(`./test-cases/import-account.spec`)
// const importContractAccount = require(`./test-cases/import-contract-account.spec`)
const deleteImportedAccount = require(`./test-cases/delete-imported-account.spec`)
const signData = require(`./test-cases/sign-data.spec`)
const exportPrivateKey = require(`./test-cases/export-private-key.spec`)
const importGanacheSeedPhrase = require(`./test-cases/import-ganache-seed-phrase.spec`)
const RSKNetworkTests = require(`./test-cases/RSK-network-tests.js`)
const checkEmittedEvents = require(`./test-cases/check-emitted-events.spec`)
// const addCustomToken = require(`./test-cases/add-token-custom.spec`)
const changePassword = require(`./test-cases/change-password.spec`)
// const addTokenFromSearch = require(`./test-cases/add-token-search.spec`)
const customRPC = require(`./test-cases/custom-rpc.spec`)
const { buildWebDriver } = require(`./webdriver`)

describe('Metamask popup page', function () {

  this.timeout(15 * 60 * 1000)
  const f = new Func()
  let driver, extensionId
  const password = '123456789'
  const newPassword = {
    correct: 'abcDEF123!@#',
    short: '123',
    incorrect: '1234567890',
  }

  before(async function () {
    if (process.env.SELENIUM_BROWSER === 'chrome') {
      const { driver: chromeDriver, extensionId: _extensionId } = await buildWebDriver({ responsive: false })
      const extensionUrl = chromeDriver.extensionUrl
      driver = chromeDriver.driver
      extensionId = _extensionId
      f.driver = driver
      f.extensionId = extensionId
      await f.driver.get(extensionUrl)
    } else if (process.env.SELENIUM_BROWSER === 'firefox') {
      const extPath = path.resolve('dist/firefox')
      driver = await Func.buildFirefoxWebdriver()
      f.driver = driver
      await f.installWebExt(extPath)
      await f.delay(700)
      extensionId = await f.getExtensionIdFirefox()
      f.extensionId = extensionId
      await driver.get(`moz-extension://${extensionId}/popup.html`)
    }

  })

  afterEach(async function () {
    // logs command not supported in firefox
    // https://github.com/SeleniumHQ/selenium/issues/2910
    if (process.env.SELENIUM_BROWSER === 'chrome') {
      // check for console errors
      const errors = await f.checkBrowserForConsoleErrors(driver)
      if (errors.length) {
        const errorReports = errors.map((err) => err.message)
        const errorMessage = `Errors found in browser console:\n${errorReports.join('\n')}`
        console.log(errorMessage)
      }
    }
    // gather extra data if test failed
    if (this.currentTest.state === 'failed') {
      await f.verboseReportOnFailure(this.currentTest)
    }
  })

  after(async function () {
    await f.driver.quit()
  })

  describe('Setup', async function () {
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    await setup(f)
  })

  describe('Log In', async function () {
    await login(f, password)
  })

  describe('Account Creation', async function () {
    await accountCreation(f, password)
  })

  describe('Connect Hardware Wallet', async function () {
    await connectHDWallet(f)
  })

  describe('Import Account', async function () {
    await importAccount(f)
  })

  // describe('Import Contract account', async () => {
  //   await importContractAccount(f, account1, getCreatedAccounts)
  // })

  describe('Delete Imported Account', async function () {
    await deleteImportedAccount(f)
  })

  describe('Sign Data', async function () {
    await signData(f)
  })

  describe('Export private key', async function () {
    await exportPrivateKey(f, password)
  })

  describe('Import Ganache seed phrase', async function () {
    await importGanacheSeedPhrase(f, account2, password)
  })

  describe('RSK network tests', async function () {
    await RSKNetworkTests(f, account1RSK)
  })

  describe('Check the filter of emitted events', async function () {
    await checkEmittedEvents(f, account1, account2)
  })

  // todo: it works locally, but doesn't work in CI
  // describe('Add Token: Custom', async () => {
  //   await addCustomToken(f, account1, account2)
  // })

  describe('Change password', async function () {
    await changePassword(f, password, newPassword)
  })

  // todo
  // describe('Add Token:Search', async () => {
  //   await addTokenFromSearch(f)
  // })

  describe('Custom RPC', async function () {
    await customRPC(f)
  })
})


