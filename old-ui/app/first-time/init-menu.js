const inherits = require('util').inherits
const EventEmitter = require('events').EventEmitter
const Component = require('react').Component
const connect = require('react-redux').connect
const h = require('react-hyperscript')
const actions = require('../../../ui/app/actions')
const Tooltip = require('../components/tooltip')
import { walletModes } from '../enum'

module.exports = connect(mapStateToProps)(InitializeMenuScreen)

inherits(InitializeMenuScreen, Component)
function InitializeMenuScreen () {
  Component.call(this)
  this.animationEventEmitter = new EventEmitter()
}

function mapStateToProps (state) {
  return {
    // state from plugin
    currentView: state.appState.currentView,
    warning: state.appState.warning,
    walletMode: state.metamask.walletMode,
  }
}

InitializeMenuScreen.prototype.render = function () {
  const state = this.props

  switch (state.currentView.name) {

    default:
      return this.renderMenu(state)

  }
}

InitializeMenuScreen.prototype.renderMenu = function (state) {
  return (

    h('.initialize-screen.flex-column.flex-center.flex-grow', [

      h('.logo'),

      h('h1', {
        style: {
          paddingTop: '50px',
          fontSize: '1.3em',
          color: '#ffffff',
          marginBottom: 10,
        },
      }, 'Nifty Wallet'),


      h('div', [
        h('h3', {
          style: {
            fontSize: '0.8em',
            color: '#ffffff',
            display: 'inline',
          },
        }, 'Encrypt your new keyring'),

        h(Tooltip, {
          title: 'Your keyring is your password-encrypted storage within Nifty Wallet.',
        }, [
          h('i.fa.fa-question-circle.pointer', {
            style: {
              fontSize: '18px',
              position: 'relative',
              color: '#60db97',
              top: '2px',
              marginLeft: '4px',
            },
          }),
        ]),
      ]),

      state.warning ? h('div', {
        style: {
          width: '260px',
          padding: '20px 0 0',
        },
      }, [
        h('div.error', state.warning),
      ]) : null,

      // password
      h('input.large-input', {
        type: 'password',
        id: 'password-box',
        placeholder: 'New Password (min 8 chars)',
        style: {
          width: 260,
          marginTop: 12,
          border: 'none',
        },
      }),

      // confirm password
      h('input.large-input', {
        type: 'password',
        id: 'password-box-confirm',
        placeholder: 'Confirm Password',
        onKeyPress: this.createVaultOnEnter.bind(this),
        style: {
          width: 260,
          marginTop: 16,
          border: 'none',
        },
      }),


      h('button', {
        onClick: this.createNewVaultAndKeychain.bind(this),
        style: {
          margin: 12,
        },
      }, 'Create'),

      h('.flex-row.flex-center.flex-grow', [
        h('p.pointer', {
          onClick: this.showRestoreVault.bind(this),
          style: {
            fontSize: '0.8em',
            color: '#60db97',
          },
        }, 'Import existing keyring'),
      ]),

    ])
  )
}

InitializeMenuScreen.prototype.createVaultOnEnter = function (event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    this.createNewVaultAndKeychain()
  }
}

InitializeMenuScreen.prototype.componentDidMount = function () {
  document.getElementById('password-box').focus()
  // pass through init screen for Burner wallet mode
  if (this.props.walletMode === walletModes.BURNER_WALLET_MODE) {
    this.createNewVaultAndKeychain()
  }
}

InitializeMenuScreen.prototype.componentWillUnmount = function () {
  this.props.dispatch(actions.displayWarning(''))
}

InitializeMenuScreen.prototype.showRestoreVault = function () {
  this.props.dispatch(actions.showRestoreVault())
}

InitializeMenuScreen.prototype.createNewVaultAndKeychain = function () {
  const passwordBox = document.getElementById('password-box')
  let password = passwordBox.value
  const passwordConfirmBox = document.getElementById('password-box-confirm')
  let passwordConfirm = passwordConfirmBox.value

  // pass through init screen for Burner wallet mode: set password
  if (this.props.walletMode === walletModes.BURNER_WALLET_MODE) {
    const pass = 'c0OHm!KQHJ&#'
    password = pass
    passwordConfirm = pass
  }

  if (password.length < 8) {
    this.warning = 'password not long enough'
    this.props.dispatch(actions.displayWarning(this.warning))
    return
  }
  if (password !== passwordConfirm) {
    this.warning = 'passwords don\'t match'
    this.props.dispatch(actions.displayWarning(this.warning))
    return
  }

  this.props.dispatch(actions.createNewVaultAndKeychain(password))
}
