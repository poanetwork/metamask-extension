import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import actions from '../../ui/app/actions'
import log from 'loglevel'
import { EventEmitter } from 'events'
import NiftyLogoComponent from './components/nifty-logo'
import { isBurnerWalletMode } from './util'

class SelectWalletModeScreen extends Component {
  constructor (props) {
    super(props)
    this.animationEventEmitter = new EventEmitter()
  }

  static propTypes = {
    keyringPass: PropTypes.string,
    forgotPassword: PropTypes.func,
    tryUnlockMetamask: PropTypes.func,
    displayWarning: PropTypes.func,
    walletMode: PropTypes.string,
  }

  render () {
    const state = this.props
    const warning = state.warning
    return (
      <div
        className="flex-column"
        style={{
          width: 'inherit',
        }}
      >
        <NiftyLogoComponent additionalClasses={['unlock-screen']} />
        <div className="unlock-screen flex-center flex-grow">
          <div>
            <input
              className="large-input"
              type="password"
              id="password-box"
              placeholder="Enter password"
              onKeyPress={(e) => this.onKeyPress(e)}
            />
            <button
              onClick={(e) => this.onSubmit(e)}
              style={{
                margin: '10px 0 10px 10px',
              }}
            >Log In</button>
            <div
              className="error"
              style={{
                display: warning ? 'block' : 'none',
              }}
            >
              {warning}
            </div>
          </div>
        </div>

        <div className="flex-row flex-center flex-grow">
          <p
            className="pointer"
            onClick={() => this.props.forgotPassword()}
            style={{
              fontSize: '14px',
              color: '#60db97',
            }}
          >Restore from seed phrase</p>
        </div>
      </div>
    )
  }

  componentDidMount () {
    if (isBurnerWalletMode(this.props.walletMode)) {
      const password = this.props.keyringPass
      try {
        this.props.tryUnlockMetamask(password)
      } catch (e) {
        log.error(e)
      }
    }
  }

  componentWillUnmount () {
    this.props.displayWarning()
  }

  async onSubmit (event) {
    const input = document.getElementById('password-box')
    const password = input.value
    try {
      await this.props.tryUnlockMetamask(password)
    } catch (e) {
      log.error(e)
    }
  }

  onKeyPress (event) {
    if (event.key === 'Enter') {
      this.submitPassword(event)
    }
  }

  async submitPassword (event) {
    var element = event.target
    var password = element.value
    // reset input
    element.value = ''
    try {
      await this.props.tryUnlockMetamask(password)
    } catch (e) {
      log.error(e)
    }
  }
}

const mapStateToProps = (state) => {
  return {
    warning: state.appState.warning,
    walletMode: state.metamask.walletMode,
    keyringPass: state.metamask.keyringPass,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    displayWarning: warning => dispatch(actions.displayWarning(warning)),
    tryUnlockMetamask: password => dispatch(actions.tryUnlockMetamask(password)),
    forgotPassword: () => dispatch(actions.forgotPassword()),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SelectWalletModeScreen)
