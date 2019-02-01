import { EventEmitter } from 'events'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import actions from '../../../ui/app/actions'
import Tooltip from '../components/tooltip'
import { walletModes } from '../enum'
import generator from 'generate-password'
import NiftyLogoComponent from '../components/nifty-logo'

class InitializeMenuScreen extends Component {
  constructor (props) {
    super(props)
    Component.call(this)
    this.animationEventEmitter = new EventEmitter()
  }

  static propTypes = {
    walletMode: PropTypes.string,
    setKeyringPass: PropTypes.func,
    displayWarning: PropTypes.func,
    createNewVaultAndKeychain: PropTypes.func,
    showRestoreVault: PropTypes.func,
  }

  render () {
    const state = this.props

    switch (state.currentView.name) {
      default:
        return this.renderMenu(state)
    }
  }

  renderMenu (state) {
    return (

      <div className="initialize-screen flex-column flex-center flex-grow">

        <NiftyLogoComponent />

        <div style={{
          marginTop: '10px',
        }}>
          <h3
            style={{
              fontSize: '0.8em',
              color: '#ffffff',
              display: 'inline',
            }}
          >Encrypt your new keyring</h3>

          <Tooltip
            title="Your keyring is your password-encrypted storage within Nifty Wallet."
          >
            <i
              className="fa fa-question-circle pointer"
              style={{
                fontSize: '18px',
                position: 'relative',
                color: '#60db97',
                top: '2px',
                marginLeft: '4px',
              }}
            />
          </Tooltip>
        </div>

        {state.warning ? <div
          style={{
            width: '260px',
            padding: '20px 0 0',
          }}
        >
          <div className="error">{state.warning}</div>
        </div> : null}

        <input className="large-input"
          type="password"
          id="password-box"
          placeholder="New Password (min 8 chars)"
          style={{
            width: 260,
            marginTop: 12,
            border: 'none',
          }}
        />

        <input className="large-input"
          type="password"
          id="password-box-confirm"
          placeholder="Confirm Password"
          style={{
            width: 260,
            marginTop: 16,
            border: 'none',
          }}
          onKeyPress={(e) => { this.createVaultOnEnter(e) }}
        />

        <button
          onClick={ e => this.createNewVaultAndKeychain(e) }
          style={{
            margin: 12,
          }}
        >Create</button>

        <div className="flex-row flex-center flex-grow">
          <p
            className="pointer"
            onClick={(e) => { this.showRestoreVault(e) }}
            style={{
              fontSize: '0.8em',
              color: '#60db97',
            }}
          >Import existing keyring</p>
        </div>

      </div>
    )
  }

  createVaultOnEnter (event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.createNewVaultAndKeychain()
    }
  }

  componentDidMount () {
    document.getElementById('password-box').focus()
    // pass through init screen for Burner wallet mode
    if (this.props.walletMode === walletModes.BURNER_WALLET_MODE) {
      this.createNewVaultAndKeychain()
    }
  }

  componentWillUnmount () {
    this.props.displayWarning('')
  }

  showRestoreVault () {
    this.props.showRestoreVault()
  }

  createNewVaultAndKeychain () {
    const passwordBox = document.getElementById('password-box')
    let password = passwordBox.value
    const passwordConfirmBox = document.getElementById('password-box-confirm')
    let passwordConfirm = passwordConfirmBox.value

    // pass through init screen for Burner wallet mode: set password
    if (this.props.walletMode === walletModes.BURNER_WALLET_MODE) {
      const pass = generator.generate({
          length: 10,
          numbers: true,
      })
      password = pass
      passwordConfirm = pass
      this.props.setKeyringPass(pass)
    }

    if (password.length < 8) {
      this.warning = 'password not long enough'
      this.props.displayWarning(this.warning)
      return
    }
    if (password !== passwordConfirm) {
      this.warning = 'passwords don\'t match'
      this.props.displayWarning(this.warning)
      return
    }

    this.props.createNewVaultAndKeychain(password)
  }

}

const mapStateToProps = (state) => {
  return {
    // state from plugin
    currentView: state.appState.currentView,
    warning: state.appState.warning,
    walletMode: state.metamask.walletMode,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setKeyringPass: (pass) => dispatch(actions.setKeyringPass(pass)),
    displayWarning: (warning) => dispatch(actions.displayWarning(warning)),
    createNewVaultAndKeychain: (password) => dispatch(actions.createNewVaultAndKeychain(password)),
    showRestoreVault: () => dispatch(actions.showRestoreVault()),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(InitializeMenuScreen)
