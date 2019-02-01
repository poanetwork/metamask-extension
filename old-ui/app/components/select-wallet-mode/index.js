import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import actions from '../../../../ui/app/actions'
import { EventEmitter } from 'events'
import NiftyLogoComponent from '../nifty-logo'
import { walletModes } from '../../enum'

class SelectWalletModeScreen extends Component {
  constructor (props) {
    super(props)
    this.animationEventEmitter = new EventEmitter()
  }

  static propTypes = {
    setWalletMode: PropTypes.func,
  }

  render () {
    const buttonAddStyle = {
      margin: '10px',
      height: '80px',
      width: '130px',
      fontSize: '17px',
    }
    return (
      <div
        className="flex-column"
        style={{
          width: 'inherit',
        }}
      >
        <NiftyLogoComponent />

        <div
          className="flex-center flex-grow"
          style={{
            marginTop: '50px',
          }}
        >
          <button
            onClick={(e) => {
              this.props.setWalletMode(walletModes.BURNER_WALLET_MODE)
            }}
            style={buttonAddStyle}
          >Burner wallet mode</button>
          <button
            onClick={(e) => {
              this.props.setWalletMode(walletModes.FULL_MODE)
            }}
            style={buttonAddStyle}
          >Classic mode</button>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    metamask: state.metamask,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setWalletMode: (mode) => dispatch(actions.setWalletMode(mode)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SelectWalletModeScreen)
